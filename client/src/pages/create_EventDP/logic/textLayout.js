const measurementCanvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null

let measurementContext = measurementCanvas ? measurementCanvas.getContext('2d') : null

export const lengthToPx = (value, unit = 'px') => {
    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed)) {
        return 0
    }

    return unit === 'pt' ? parsed * (96 / 72) : parsed
}

const normalizeTextCase = (value, textTransform) => {
    const source = String(value || '')

    if (textTransform === 'uppercase') {
        return source.toUpperCase()
    }

    if (textTransform === 'lowercase') {
        return source.toLowerCase()
    }

    if (textTransform === 'capitalize') {
        return source.replace(/\b\w/g, (char) => char.toUpperCase())
    }

    return source
}

const measureLineWidth = (ctx, line, letterSpacingPx) => {
    if (!line) {
        return 0
    }

    return ctx.measureText(line).width + (letterSpacingPx * Math.max(0, line.length - 1))
}

const breakWordToFit = (ctx, word, availableWidth, letterSpacingPx) => {
    if (!word) {
        return []
    }

    if (measureLineWidth(ctx, word, letterSpacingPx) <= availableWidth) {
        return [word]
    }

    const lines = []
    let current = ''

    for (const char of word) {
        const next = current ? `${current}${char}` : char
        if (current && measureLineWidth(ctx, next, letterSpacingPx) > availableWidth) {
            lines.push(current)
            current = char
            continue
        }

        current = next
    }

    if (current) {
        lines.push(current)
    }

    return lines
}

const wrapTextToLines = (ctx, text, availableWidth, letterSpacingPx) => {
    const paragraphs = String(text || '').split(/\r?\n/)
    const lines = []

    paragraphs.forEach((paragraph, paragraphIndex) => {
        const words = String(paragraph || '').split(/\s+/).filter(Boolean)

        if (words.length === 0) {
            lines.push('')
            return
        }

        let currentLine = ''

        const flushCurrentLine = () => {
            if (currentLine) {
                lines.push(currentLine)
                currentLine = ''
            }
        }

        words.forEach((word) => {
            const nextLine = currentLine ? `${currentLine} ${word}` : word
            if (measureLineWidth(ctx, nextLine, letterSpacingPx) <= availableWidth) {
                currentLine = nextLine
                return
            }

            flushCurrentLine()
            const brokenWord = breakWordToFit(ctx, word, availableWidth, letterSpacingPx)
            if (brokenWord.length > 1) {
                lines.push(...brokenWord.slice(0, -1))
                currentLine = brokenWord[brokenWord.length - 1]
                return
            }

            currentLine = brokenWord[0] || word
        })

        flushCurrentLine()

        if (paragraphIndex < paragraphs.length - 1) {
            lines.push('')
        }
    })

    return lines
}

const resolveLineHeightPx = (fontSizePx, textStyle = {}, scale = 1) => {
    const unit = textStyle?.lineHeightUnit || 'unitless'
    const parsed = Number.parseFloat(textStyle?.lineHeight)

    if (!Number.isFinite(parsed)) {
        return fontSizePx * 1.25
    }

    if (unit === 'unitless') {
        return fontSizePx * Math.max(0.6, Math.min(parsed, 4))
    }

    return Math.max(1, lengthToPx(parsed, unit) * scale)
}

export const getTextMeasurementContext = () => {
    if (measurementContext) {
        return measurementContext
    }

    if (typeof document === 'undefined') {
        return null
    }

    const canvas = document.createElement('canvas')
    measurementContext = canvas.getContext('2d')
    return measurementContext
}

export const fitTextLayoutInZone = ({
    ctx,
    text,
    width,
    height,
    textStyle = {},
    minFontSizePx = 1,
}) => {
    if (!ctx || !width || !height || !text) {
        return null
    }

    const fontSizeUnit = textStyle?.fontSizeUnit || 'px'
    const letterSpacingUnit = textStyle?.letterSpacingUnit || 'px'
    const baseFontSizePx = Math.max(1, lengthToPx(textStyle?.fontSize || 30, fontSizeUnit))
    const baseLetterSpacingPx = lengthToPx(textStyle?.letterSpacing || 0, letterSpacingUnit)
    const fontFamily = textStyle?.fontFamily || 'Poppins'
    const fontWeight = Number(textStyle?.fontWeight || 700)
    const fontStyle = textStyle?.fontStyle === 'italic' ? 'italic' : 'normal'
    const textDecoration = ['none', 'underline', 'line-through'].includes(textStyle?.textDecoration)
        ? textStyle.textDecoration
        : 'none'
    const textTransform = ['none', 'uppercase', 'lowercase', 'capitalize'].includes(textStyle?.textTransform)
        ? textStyle.textTransform
        : 'none'
    const textAlign = ['left', 'right', 'center'].includes(textStyle?.textAlign) ? textStyle.textAlign : 'center'
    const horizontalPadding = 6
    const verticalPadding = 8
    const availableWidth = Math.max(1, width - (horizontalPadding * 2))
    const availableHeight = Math.max(1, height - (verticalPadding * 2))
    const resolvedText = normalizeTextCase(text, textTransform)
    const maxFontSizePx = Math.max(
        baseFontSizePx,
        Math.min(
            availableHeight * 0.92,
            baseFontSizePx * 6,
            240,
        ),
    )

    const measureAtFontSize = (fontSizePx) => {
        const safeFontSizePx = Math.max(minFontSizePx, fontSizePx)
        const fontScale = safeFontSizePx / Math.max(1, baseFontSizePx)
        const letterSpacingPx = baseLetterSpacingPx * fontScale

        ctx.save()
        ctx.font = `${fontStyle} ${fontWeight} ${safeFontSizePx}px ${fontFamily}`

        const lines = wrapTextToLines(ctx, resolvedText, availableWidth, letterSpacingPx)
        const lineHeightPx = resolveLineHeightPx(safeFontSizePx, textStyle, fontScale)
        const lineWidths = lines.map((line) => measureLineWidth(ctx, line, letterSpacingPx))
        const totalHeight = lines.length * lineHeightPx
        const maxLineWidth = lineWidths.length > 0 ? Math.max(...lineWidths) : 0

        ctx.restore()

        return {
            scale: fontScale,
            fontSizePx: safeFontSizePx,
            lineHeightPx,
            letterSpacingPx,
            lines,
            totalHeight,
            maxLineWidth,
            fits: maxLineWidth <= availableWidth && totalHeight <= availableHeight,
            fontFamily,
            fontWeight,
            fontStyle,
            textDecoration,
            textTransform,
            textAlign,
            color: textStyle?.color || '#FFFFFF',
        }
    }

    const binarySearchBestFit = (minimumFontSizePx, maximumFontSizePx) => {
        let low = Math.max(minFontSizePx, minimumFontSizePx)
        let high = Math.max(low, maximumFontSizePx)
        let bestLayout = measureAtFontSize(low)

        if (!bestLayout.fits) {
            while (high > low + 0.5) {
                const mid = (low + high) / 2
                const candidate = measureAtFontSize(mid)

                if (candidate.fits) {
                    bestLayout = candidate
                    low = mid
                } else {
                    high = mid
                }

                if (Math.abs(high - low) < 0.5) {
                    break
                }
            }

            return bestLayout
        }

        while (high < maximumFontSizePx) {
            const nextHigh = Math.min(maximumFontSizePx, Math.max(high * 1.18, high + 1))
            if (Math.abs(nextHigh - high) < 0.5) {
                break
            }

            const candidate = measureAtFontSize(nextHigh)
            if (!candidate.fits) {
                low = high
                high = nextHigh
                break
            }

            bestLayout = candidate
            low = nextHigh
            high = nextHigh
        }

        if (bestLayout.fits && high === low) {
            return bestLayout
        }

        let searchLow = low
        let searchHigh = Math.max(high, low)

        for (let index = 0; index < 8; index += 1) {
            const mid = (searchLow + searchHigh) / 2
            const candidate = measureAtFontSize(mid)
            if (candidate.fits) {
                bestLayout = candidate
                searchLow = mid
            } else {
                searchHigh = mid
            }

            if (Math.abs(searchHigh - searchLow) < 0.5) {
                break
            }
        }

        return bestLayout
    }

    return binarySearchBestFit(baseFontSizePx, maxFontSizePx)
}
