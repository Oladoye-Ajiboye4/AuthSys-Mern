const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const asRect = (rect) => {
    if (!rect || typeof rect !== 'object') {
        return null
    }

    return {
        x: Math.max(0, toNumber(rect.x, 0)),
        y: Math.max(0, toNumber(rect.y, 0)),
        width: Math.max(0, toNumber(rect.width, 0)),
        height: Math.max(0, toNumber(rect.height, 0)),
    }
}

const fromNormalised = (normalised, asset) => {
    if (!normalised || typeof normalised !== 'object') {
        return null
    }

    const assetWidth = Math.max(1, toNumber(asset?.width, 0))
    const assetHeight = Math.max(1, toNumber(asset?.height, 0))

    const x = clamp(toNumber(normalised.x, 0), 0, 1)
    const y = clamp(toNumber(normalised.y, 0), 0, 1)
    const width = clamp(toNumber(normalised.width, 0), 0, 1)
    const height = clamp(toNumber(normalised.height, 0), 0, 1)

    return {
        x: Math.round(x * assetWidth),
        y: Math.round(y * assetHeight),
        width: Math.round(width * assetWidth),
        height: Math.round(height * assetHeight),
    }
}

const toNormalised = (actual, asset) => {
    if (!actual || typeof actual !== 'object' || !asset) {
        return null
    }

    const assetWidth = Math.max(1, toNumber(asset?.width, 0))
    const assetHeight = Math.max(1, toNumber(asset?.height, 0))

    return {
        x: Math.round((toNumber(actual.x, 0) / assetWidth) * 10000) / 10000,
        y: Math.round((toNumber(actual.y, 0) / assetHeight) * 10000) / 10000,
        width: Math.round((toNumber(actual.width, 0) / assetWidth) * 10000) / 10000,
        height: Math.round((toNumber(actual.height, 0) / assetHeight) * 10000) / 10000,
    }
}

const normalizeZone = (zone, asset, fallbackStyle = null) => {
    if (!zone || typeof zone !== 'object') {
        return null
    }

    const display = asRect(zone.display)
    const actual = asRect(zone.actual) || fromNormalised(zone.normalised, asset) || display
    const normalised = actual ? toNormalised(actual, asset) : null
    const style = zone.style && typeof zone.style === 'object'
        ? { ...zone.style }
        : (fallbackStyle && typeof fallbackStyle === 'object' ? { ...fallbackStyle } : {})

    if (!display && !actual) {
        return null
    }

    return {
        display: display || actual,
        actual: actual || display,
        normalised: normalised,
        style,
    }
}

const normalizeEditor = (editor, asset) => {
    if (!editor || typeof editor !== 'object') {
        return editor
    }

    const nextEditor = {
        ...editor,
        committedZone: normalizeZone(editor.committedZone, asset),
    }

    if (Array.isArray(editor.textZones)) {
        const fallbackStyle = editor.guestTextStyle && typeof editor.guestTextStyle === 'object'
            ? editor.guestTextStyle
            : null

        nextEditor.textZones = editor.textZones
            .map((zone) => normalizeZone(zone, asset, fallbackStyle))
            .filter(Boolean)
    }

    return nextEditor
}

module.exports = normalizeEditor
