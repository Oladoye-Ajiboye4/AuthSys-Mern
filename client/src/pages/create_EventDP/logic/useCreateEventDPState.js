import { useMemo, useState } from 'react'
import { BORDER_STYLES, DEFAULT_GUEST_FIELDS } from '../constants'
import { clamp, fitCanvasToViewport, ZONE_SHAPES } from './canvasMath'
import useHistoryStack from './useHistoryStack'

const createSnapshot = (state) => ({
    zoneShape: state.zoneShape,
    bleedGuides: state.bleedGuides,
    backgroundOpacity: state.backgroundOpacity,
    cornerRadius: state.cornerRadius,
    borderStyle: state.borderStyle,
    snapToGrid: state.snapToGrid,
    guestFields: state.guestFields,
    zoom: state.zoom,
})

const useCreateEventDPState = () => {
    const [uploadedImage, setUploadedImage] = useState(null)
    const [zoneShape, setZoneShape] = useState('square')
    const [committedZone, setCommittedZone] = useState(null)
    const [bleedGuides, setBleedGuides] = useState(true)
    const [backgroundOpacity, setBackgroundOpacity] = useState(85)
    const [cornerRadius, setCornerRadius] = useState(16)
    const [borderStyle, setBorderStyle] = useState(BORDER_STYLES[1].id)
    const [snapToGrid, setSnapToGrid] = useState(false)
    const [guestFields, setGuestFields] = useState(DEFAULT_GUEST_FIELDS)
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
        guestFields,
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
            guestFields,
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

    const clearCommittedZone = () => {
        setCommittedZone(null)
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

    const toggleGuestField = (fieldId) => {
        const nextFields = guestFields.map((field) => {
            if (field.id !== fieldId) {
                return field
            }
            return {
                ...field,
                enabled: !field.enabled,
            }
        })

        setGuestFields(nextFields)
        persistSnapshot({ guestFields: nextFields })
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
        setGuestFields(snapshot.guestFields)
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
        guestFields,
        toggleGuestField,
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