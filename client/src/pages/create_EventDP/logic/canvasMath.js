// Zone shape options: what kind of selection the event creator can draw on their image
export const ZONE_SHAPES = {
    square: { label: 'Square', icon: 'mdi:square-outline', description: 'Rectangular zone with optional rounded corners' },
    circle: { label: 'Circle', icon: 'mdi:circle-outline', description: 'Perfectly circular / elliptical zone' },
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Converts a raw mouse-drag rect (display-pixel space) into:
//   - displayRect  : { x, y, width, height } in display pixels (for rendering the overlay)
//   - normalised   : { x, y, width, height } each 0-1 relative to the canvas element size
//                    (use this to map back to real image coordinates later)
export const computeZoneFromDrag = ({ startX, startY, endX, endY, canvasEl }) => {
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const width = Math.abs(endX - startX)
    const height = Math.abs(endY - startY)

    const displayRect = { x, y, width, height }

    if (!canvasEl) {
        return { displayRect, normalised: null }
    }

    const { width: elW, height: elH } = canvasEl.getBoundingClientRect()
    const normalised = {
        x: x / elW,
        y: y / elH,
        width: width / elW,
        height: height / elH,
    }

    return { displayRect, normalised }
}

export const fitCanvasToViewport = ({
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
    zoom,
}) => {
    if (!canvasWidth || !canvasHeight || !viewportWidth || !viewportHeight) {
        return { width: 280, height: 480 }
    }

    const ratio = canvasWidth / canvasHeight
    const fittedByWidth = viewportWidth
    const fittedByHeight = viewportHeight * ratio

    let width = fittedByWidth
    let height = fittedByWidth / ratio

    if (fittedByHeight < fittedByWidth) {
        width = fittedByHeight
        height = viewportHeight
    }

    const clampedZoom = clamp(zoom, 0.5, 1.8)

    return {
        width: Math.round(width * clampedZoom),
        height: Math.round(height * clampedZoom),
    }
}