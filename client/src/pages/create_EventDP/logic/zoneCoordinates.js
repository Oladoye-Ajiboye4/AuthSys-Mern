/**
 * Zone Coordinate System Helper
 * 
 * Converts between three coordinate systems:
 * - Display: Current viewport pixel coordinates (changes with zoom/resize)
 * - Actual: Full image pixel coordinates (immutable, for export)
 * - Normalized: 0-1 ratio based on image dimensions (robust fallback)
 */

/**
 * Calculate actual coordinates from display coordinates
 * @param {Object} displayCoords - {x, y, width, height} in viewport pixels
 * @param {Object} hostCanvasSize - Current display canvas size {width, height}
 * @param {Object} imageDimensions - Full image size {width, height}
 * @returns {Object} {x, y, width, height} in full image pixels
 */
export const displayToActual = (displayCoords, hostCanvasSize, imageDimensions) => {
    if (!displayCoords || !hostCanvasSize || !imageDimensions) return null

    const scaleX = imageDimensions.width / hostCanvasSize.width
    const scaleY = imageDimensions.height / hostCanvasSize.height

    return {
        x: Math.round(displayCoords.x * scaleX),
        y: Math.round(displayCoords.y * scaleY),
        width: Math.round(displayCoords.width * scaleX),
        height: Math.round(displayCoords.height * scaleY),
    }
}

/**
 * Calculate normalized coordinates from actual coordinates
 * @param {Object} actual - {x, y, width, height} in image pixels
 * @param {Object} imageDimensions - Full image size {width, height}
 * @returns {Object} {x, y, width, height} as 0-1 ratios
 */
export const actualToNormalized = (actual, imageDimensions) => {
    if (!actual || !imageDimensions) return null

    const imageWidth = Math.max(1, Math.abs(imageDimensions.width))
    const imageHeight = Math.max(1, Math.abs(imageDimensions.height))

    return {
        x: Math.round((actual.x / imageWidth) * 10000) / 10000,
        y: Math.round((actual.y / imageHeight) * 10000) / 10000,
        width: Math.round((actual.width / imageWidth) * 10000) / 10000,
        height: Math.round((actual.height / imageHeight) * 10000) / 10000,
    }
}

/**
 * Recover actual coordinates from normalized coordinates
 * @param {Object} normalized - {x, y, width, height} as 0-1 ratios
 * @param {Object} imageDimensions - Full image size {width, height}
 * @returns {Object} {x, y, width, height} in image pixels
 */
export const normalizedToActual = (normalized, imageDimensions) => {
    if (!normalized || !imageDimensions) return null

    const imageWidth = Math.max(1, Math.abs(imageDimensions.width))
    const imageHeight = Math.max(1, Math.abs(imageDimensions.height))

    return {
        x: Math.round(normalized.x * imageWidth),
        y: Math.round(normalized.y * imageHeight),
        width: Math.round(normalized.width * imageWidth),
        height: Math.round(normalized.height * imageHeight),
    }
}

/**
 * Calculate actual coordinates from normalized (recovery function)
 * @param {Object} normalized - {x, y, width, height} as 0-1 ratios
 * @param {Object} imageDimensions - Full image size {width, height}
 * @returns {Object} {x, y, width, height} in image pixels
 */
export const fromNormalised = (normalized, imageDimensions) => {
    return normalizedToActual(normalized, imageDimensions)
}

/**
 * Create all three coordinate types for a zone
 * @param {Object} displayCoords - Current display coordinates
 * @param {Object} hostCanvasSize - Current host canvas size
 * @param {Object} imageDimensions - Full image dimensions
 * @returns {Object} {display, actual, normalised} all three coordinate types
 */
export const createZoneCoordinates = (displayCoords, hostCanvasSize, imageDimensions) => {
    if (!displayCoords || !hostCanvasSize || !imageDimensions) return null

    const display = displayCoords
    const actual = displayToActual(displayCoords, hostCanvasSize, imageDimensions)
    const normalised = actual ? actualToNormalized(actual, imageDimensions) : null

    return {
        display,
        actual,
        normalised,
    }
}

/**
 * Resolve zone coordinates with priority fallback
 * Priority: normalised > actual > display
 * @param {Object} zone - Zone with any combination of {display, actual, normalised}
 * @param {Object} imageDimensions - Full image dimensions
 * @returns {Object} Resolved actual coordinates
 */
export const resolveZoneActual = (zone, imageDimensions) => {
    if (!zone) return null

    // Priority 1: Normalised (most robust across viewports)
    if (zone.normalised && Object.keys(zone.normalised).length > 0) {
        const resolved = normalizedToActual(zone.normalised, imageDimensions)
        if (resolved && resolved.width > 0 && resolved.height > 0) {
            return resolved
        }
    }

    // Priority 2: Actual (immutable source)
    if (zone.actual && zone.actual.width > 0 && zone.actual.height > 0) {
        return zone.actual
    }

    // Priority 3: Display (fallback only)
    if (zone.display && zone.display.width > 0 && zone.display.height > 0) {
        return zone.display
    }

    return null
}

/**
 * Scale actual coordinates to guest viewport size
 * @param {Object} actualCoords - {x, y, width, height} in image pixels
 * @param {Object} imageDimensions - Full image size {width, height}
 * @param {Object} guestCanvasSize - Current guest viewport size {width, height}
 * @returns {Object} {x, y, width, height} in guest viewport pixels
 */
export const actualToGuestDisplay = (actualCoords, imageDimensions, guestCanvasSize) => {
    if (!actualCoords || !imageDimensions || !guestCanvasSize) return null

    const scaleX = guestCanvasSize.width / imageDimensions.width
    const scaleY = guestCanvasSize.height / imageDimensions.height

    return {
        x: Math.round(actualCoords.x * scaleX),
        y: Math.round(actualCoords.y * scaleY),
        width: Math.round(actualCoords.width * scaleX),
        height: Math.round(actualCoords.height * scaleY),
    }
}
