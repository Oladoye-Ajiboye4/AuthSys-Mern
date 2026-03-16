import { useMemo, useState } from 'react'
import { BORDER_STYLES } from '../constants'
import { clamp, fitCanvasToViewport, ZONE_SHAPES } from './canvasMath'
import useHistoryStack from './useHistoryStack'

const createSnapshot = (state) => ({
    zoneShape: state.zoneShape,
    bleedGuides: state.bleedGuides,
    backgroundOpacity: state.backgroundOpacity,
    cornerRadius: state.cornerRadius,
    borderStyle: state.borderStyle,
    snapToGrid: state.snapToGrid,
    allowGuestText: state.allowGuestText,
    textZone: state.textZone,
    activeCanvasTool: state.activeCanvasTool,
    guestTextStyle: state.guestTextStyle,
    zoom: state.zoom,
})

const DEFAULT_GUEST_TEXT_STYLE = {
    text: 'Add your custom message',
    fontFamily: 'Poppins',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 1.25,
    fontWeight: 700,
    textAlign: 'center',
}

const normalizeTextStyle = (style) => {
    const next = { ...style }
    next.text = String(next.text || '').slice(0, 90)
    next.fontSize = clamp(Number(next.fontSize) || DEFAULT_GUEST_TEXT_STYLE.fontSize, 16, 72)
    next.letterSpacing = clamp(Number(next.letterSpacing) || 0, -1, 12)
    next.lineHeight = clamp(Number(next.lineHeight) || DEFAULT_GUEST_TEXT_STYLE.lineHeight, 0.9, 2)

    const allowedWeights = [400, 500, 600, 700]
    const normalizedWeight = Number(next.fontWeight)
    next.fontWeight = allowedWeights.includes(normalizedWeight)
        ? normalizedWeight
        : DEFAULT_GUEST_TEXT_STYLE.fontWeight

    const allowedAlignments = ['left', 'center', 'right']
    next.textAlign = allowedAlignments.includes(next.textAlign)
        ? next.textAlign
        : DEFAULT_GUEST_TEXT_STYLE.textAlign

    if (!/^#([A-Fa-f0-9]{6})$/.test(String(next.color || ''))) {
        next.color = DEFAULT_GUEST_TEXT_STYLE.color
    }

    return next
}

const useCreateEventDPState = () => {
    const [uploadedImage, setUploadedImage] = useState(null)
    const [zoneShape, setZoneShape] = useState('square')
    const [committedZone, setCommittedZone] = useState(null)
    const [textZone, setTextZone] = useState(null)
    const [bleedGuides, setBleedGuides] = useState(true)
    const [backgroundOpacity, setBackgroundOpacity] = useState(85)
    const [cornerRadius, setCornerRadius] = useState(16)
    const [borderStyle, setBorderStyle] = useState(BORDER_STYLES[1].id)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [allowGuestText, setAllowGuestText] = useState(false)
    const [activeCanvasTool, setActiveCanvasTool] = useState('photo')
    const [guestTextStyle, setGuestTextStyle] = useState(DEFAULT_GUEST_TEXT_STYLE)
    const [previewMode, setPreviewMode] = useState(false)
    const [zoom, setZoom] = useState(1)
    const [activeMenu, setActiveMenu] = useState('template')

    const {
        canUndo,
        canRedo,
        pushState,
        undo,
        redo,
    } = useHistoryStack(createSnapshot({
        zoneShape,
        bleedGuides,
        backgroundOpacity,
        cornerRadius,
        borderStyle,
        snapToGrid,
        allowGuestText,
        textZone,
        activeCanvasTool,
        guestTextStyle,
        zoom,
    }))

    // Canvas dimensions come entirely from the uploaded image; if no image, a sensible default.
    const canvasDimensions = useMemo(() => {
        if (uploadedImage?.width && uploadedImage?.height) {
            return { width: uploadedImage.width, height: uploadedImage.height }
        }
        return { width: 1080, height: 1920 }
    }, [uploadedImage])

    const displayedCanvasSize = useMemo(() => {
        return fitCanvasToViewport({
            canvasWidth: canvasDimensions.width,
            canvasHeight: canvasDimensions.height,
            viewportWidth: 340,
            viewportHeight: 610,
            zoom,
        })
    }, [canvasDimensions, zoom])

    const persistSnapshot = (overrides = {}) => {
        pushState(createSnapshot({
            zoneShape,
            bleedGuides,
            backgroundOpacity,
            cornerRadius,
            borderStyle,
            snapToGrid,
            allowGuestText,
            textZone,
            activeCanvasTool,
            guestTextStyle,
            zoom,
            ...overrides,
        }))
    }

    const selectZoneShape = (shape) => {
        setZoneShape(shape)
        setCommittedZone(null)   // clear existing zone when shape type changes
        persistSnapshot({ zoneShape: shape })
    }

    const handleZoneCommit = (zone) => {
        setCommittedZone(zone)
    }

    const handleTextZoneCommit = (zone) => {
        setTextZone(zone)
    }

    const clearCommittedZone = () => {
        setCommittedZone(null)
    }

    const clearTextZone = () => {
        setTextZone(null)
    }

    const setOpacity = (value) => {
        const normalized = clamp(value, 25, 100)
        setBackgroundOpacity(normalized)
        persistSnapshot({ backgroundOpacity: normalized })
    }

    const setRadius = (value) => {
        const normalized = clamp(value, 0, 52)
        setCornerRadius(normalized)
        persistSnapshot({ cornerRadius: normalized })
    }

    const setZoomLevel = (nextZoom) => {
        const normalized = clamp(nextZoom, 0.5, 1.8)
        setZoom(normalized)
        persistSnapshot({ zoom: normalized })
    }

    const handleImageUpload = (file) => {
        if (!file) {
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                setUploadedImage({
                    src: reader.result,
                    width: img.width,
                    height: img.height,
                    name: file.name,
                })
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    }

    const removeUploadedImage = () => {
        setUploadedImage(null)
    }

    const toggleGuestText = () => {
        const next = !allowGuestText
        const nextTool = next ? activeCanvasTool : 'photo'
        const nextTextZone = next ? textZone : null

        setAllowGuestText(next)
        setActiveCanvasTool(nextTool)
        if (!next) {
            setTextZone(null)
        }

        persistSnapshot({
            allowGuestText: next,
            activeCanvasTool: nextTool,
            textZone: nextTextZone,
        })
    }

    const selectCanvasTool = (tool) => {
        const normalized = tool === 'text' && allowGuestText ? 'text' : 'photo'
        setActiveCanvasTool(normalized)
        persistSnapshot({ activeCanvasTool: normalized })
    }

    const updateGuestTextStyle = (updates) => {
        const nextStyle = normalizeTextStyle({
            ...guestTextStyle,
            ...updates,
        })
        setGuestTextStyle(nextStyle)
        persistSnapshot({ guestTextStyle: nextStyle })
    }

    const restoreFromSnapshot = (snapshot) => {
        if (!snapshot) {
            return
        }
        setZoneShape(snapshot.zoneShape)
        setBleedGuides(snapshot.bleedGuides)
        setBackgroundOpacity(snapshot.backgroundOpacity)
        setCornerRadius(snapshot.cornerRadius)
        setBorderStyle(snapshot.borderStyle)
        setSnapToGrid(snapshot.snapToGrid)
        setAllowGuestText(Boolean(snapshot.allowGuestText))
        setTextZone(snapshot.textZone || null)
        setActiveCanvasTool(snapshot.activeCanvasTool || 'photo')
        setGuestTextStyle(normalizeTextStyle(snapshot.guestTextStyle || DEFAULT_GUEST_TEXT_STYLE))
        setZoom(snapshot.zoom)
    }

    const toggleBleedGuides = () => {
        const next = !bleedGuides
        setBleedGuides(next)
        persistSnapshot({ bleedGuides: next })
    }

    const changeBorderStyle = (nextBorderStyle) => {
        setBorderStyle(nextBorderStyle)
        persistSnapshot({ borderStyle: nextBorderStyle })
    }

    const toggleSnapToGrid = () => {
        const next = !snapToGrid
        setSnapToGrid(next)
        persistSnapshot({ snapToGrid: next })
    }

    const handleUndo = () => {
        const snapshot = undo()
        restoreFromSnapshot(snapshot)
    }

    const handleRedo = () => {
        const snapshot = redo()
        restoreFromSnapshot(snapshot)
    }

    return {
        activeMenu,
        setActiveMenu,
        // zone selection
        zoneShape,
        selectZoneShape,
        committedZone,
        handleZoneCommit,
        clearCommittedZone,
        textZone,
        handleTextZoneCommit,
        clearTextZone,
        zoneShapes: ZONE_SHAPES,
        // frame settings
        bleedGuides,
        toggleBleedGuides,
        backgroundOpacity,
        setOpacity,
        cornerRadius,
        setRadius,
        borderStyle,
        changeBorderStyle,
        snapToGrid,
        toggleSnapToGrid,
        allowGuestText,
        toggleGuestText,
        activeCanvasTool,
        selectCanvasTool,
        guestTextStyle,
        updateGuestTextStyle,
        previewMode,
        setPreviewMode,
        zoom,
        setZoomLevel,
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,
        uploadedImage,
        handleImageUpload,
        removeUploadedImage,
        canvasDimensions,
        displayedCanvasSize,
    }
}

export default useCreateEventDPState