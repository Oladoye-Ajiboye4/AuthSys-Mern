import { useCallback, useRef, useState } from 'react'
import { computeZoneFromDrag } from './canvasMath'
import { createZoneCoordinates } from './zoneCoordinates'

const MIN_ZONE_SIZE = 12

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const pointInRect = (point, rect) => (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
)

const toZonePayload = ({ rect, zoneShape, canvasDimensions, displayedCanvasSize }) => {
    // Create all three coordinate types
    const coordinates = createZoneCoordinates(rect, displayedCanvasSize, canvasDimensions)

    return {
        shape: zoneShape,
        display: coordinates.display,
        actual: coordinates.actual,
        normalised: coordinates.normalised,
    }
}

const resizeRect = ({ startRect, dx, dy, handle, boundsWidth, boundsHeight }) => {
    const left = startRect.x
    const top = startRect.y
    const right = startRect.x + startRect.width
    const bottom = startRect.y + startRect.height

    let nextLeft = left
    let nextTop = top
    let nextRight = right
    let nextBottom = bottom

    if (handle.includes('w')) {
        nextLeft = clamp(left + dx, 0, right - MIN_ZONE_SIZE)
    }
    if (handle.includes('e')) {
        nextRight = clamp(right + dx, left + MIN_ZONE_SIZE, boundsWidth)
    }
    if (handle.includes('n')) {
        nextTop = clamp(top + dy, 0, bottom - MIN_ZONE_SIZE)
    }
    if (handle.includes('s')) {
        nextBottom = clamp(bottom + dy, top + MIN_ZONE_SIZE, boundsHeight)
    }

    return {
        x: nextLeft,
        y: nextTop,
        width: nextRight - nextLeft,
        height: nextBottom - nextTop,
    }
}

const useZoneSelector = ({ zoneShape, committedZone, onZoneCommit, canvasDimensions, displayedCanvasSize }) => {
    const canvasRef = useRef(null)
    const interactionRef = useRef(null)

    const [isInteracting, setIsInteracting] = useState(false)
    const [draftRect, setDraftRect] = useState(null)

    const getLocalCoords = useCallback((event) => {
        const el = canvasRef.current
        if (!el) return { x: 0, y: 0 }

        const rect = el.getBoundingClientRect()
        const clientX = event.touches ? event.touches[0].clientX : event.clientX
        const clientY = event.touches ? event.touches[0].clientY : event.clientY

        return {
            x: clamp(clientX - rect.left, 0, rect.width),
            y: clamp(clientY - rect.top, 0, rect.height),
        }
    }, [])

    const commitRect = useCallback((rect) => {
        if (!rect || rect.width < MIN_ZONE_SIZE || rect.height < MIN_ZONE_SIZE) {
            setDraftRect(null)
            setIsInteracting(false)
            interactionRef.current = null
            return
        }

        const zone = toZonePayload({
            rect,
            zoneShape,
            canvasDimensions,
            displayedCanvasSize,
        })
        setDraftRect(null)
        setIsInteracting(false)
        interactionRef.current = null
        console.log('[EventDP] Guest photo zone:', zone)
        onZoneCommit?.(zone)
    }, [onZoneCommit, zoneShape, canvasDimensions, displayedCanvasSize])

    const onPointerDown = useCallback((event) => {
        const canvasEl = canvasRef.current
        if (!canvasEl) return
        if (event.target.closest('[data-zone-control]')) return

        const point = getLocalCoords(event)
        const activeRect = committedZone?.display
        const handle = event.target.dataset?.resizeHandle

        if (event.cancelable) event.preventDefault()

        if (handle && activeRect) {
            interactionRef.current = {
                mode: 'resize',
                startPoint: point,
                startRect: activeRect,
                handle,
            }
            setIsInteracting(true)
            setDraftRect(activeRect)
            return
        }

        if (activeRect && pointInRect(point, activeRect)) {
            interactionRef.current = {
                mode: 'move',
                startPoint: point,
                startRect: activeRect,
            }
            setIsInteracting(true)
            setDraftRect(activeRect)
            return
        }

        interactionRef.current = {
            mode: 'draw',
            startPoint: point,
        }
        setIsInteracting(true)
        setDraftRect({ x: point.x, y: point.y, width: 0, height: 0 })
    }, [committedZone, getLocalCoords])

    const onPointerMove = useCallback((event) => {
        if (!isInteracting || !interactionRef.current || !canvasRef.current) return

        const point = getLocalCoords(event)
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const interaction = interactionRef.current

        if (event.cancelable) event.preventDefault()

        if (interaction.mode === 'draw') {
            const { displayRect } = computeZoneFromDrag({
                startX: interaction.startPoint.x,
                startY: interaction.startPoint.y,
                endX: point.x,
                endY: point.y,
                canvasEl: canvasRef.current,
            })
            setDraftRect(displayRect)
            return
        }

        if (interaction.mode === 'move') {
            const dx = point.x - interaction.startPoint.x
            const dy = point.y - interaction.startPoint.y
            const nextX = clamp(interaction.startRect.x + dx, 0, canvasRect.width - interaction.startRect.width)
            const nextY = clamp(interaction.startRect.y + dy, 0, canvasRect.height - interaction.startRect.height)

            setDraftRect({
                x: nextX,
                y: nextY,
                width: interaction.startRect.width,
                height: interaction.startRect.height,
            })
            return
        }

        const dx = point.x - interaction.startPoint.x
        const dy = point.y - interaction.startPoint.y

        setDraftRect(resizeRect({
            startRect: interaction.startRect,
            dx,
            dy,
            handle: interaction.handle,
            boundsWidth: canvasRect.width,
            boundsHeight: canvasRect.height,
        }))
    }, [getLocalCoords, isInteracting])

    const onPointerUp = useCallback((event) => {
        if (!isInteracting) return
        if (event.cancelable) event.preventDefault()
        commitRect(draftRect)
    }, [commitRect, draftRect, isInteracting])

    const activeRect = draftRect || committedZone?.display || null

    return {
        canvasRef,
        isInteracting,
        activeRect,
        pointerHandlers: {
            onPointerDown: onPointerDown,
            onPointerMove: onPointerMove,
            onPointerUp: onPointerUp,
            onPointerCancel: onPointerUp,
            onPointerLeave: onPointerUp,
        },
    }
}

export default useZoneSelector
