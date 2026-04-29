const GoogleFontCatalog = require('../../models/googleFontCatalog.model')

const GOOGLE_FONTS_ENDPOINT = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity'
const CACHE_KEY = 'google-fonts-catalog-v1'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

const toNumericVariants = (variants = []) => {
    const parsed = variants
        .map((variant) => {
            if (variant === 'regular' || variant === 'italic') {
                return 400
            }

            const match = String(variant).match(/\d{3}/)
            if (!match) {
                return null
            }

            const value = Number(match[0])
            if (!Number.isFinite(value)) {
                return null
            }

            return Math.min(900, Math.max(100, value))
        })
        .filter((value) => Number.isInteger(value))

    const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b)
    return uniqueSorted.length > 0 ? uniqueSorted : [400]
}

const normalizeFonts = (items = []) => {
    return items
        .filter((item) => item && typeof item.family === 'string')
        .map((item) => ({
            family: item.family.trim(),
            category: String(item.category || '').trim(),
            variants: toNumericVariants(item.variants),
        }))
        .filter((item) => item.family.length > 0)
}

const fetchGoogleFontCatalog = async () => {
    const apiKey = String(process.env.GOOGLE_FONT_API_KEY || '').trim()
    if (!apiKey) {
        throw new Error('GOOGLE_FONT_API_KEY is not configured')
    }

    const response = await fetch(`${GOOGLE_FONTS_ENDPOINT}&key=${encodeURIComponent(apiKey)}`)
    if (!response.ok) {
        const message = await response.text()
        throw new Error(`Google Fonts API request failed (${response.status}): ${message.slice(0, 250)}`)
    }

    const payload = await response.json()
    const items = Array.isArray(payload?.items) ? payload.items : []

    return {
        fonts: normalizeFonts(items),
        etag: String(response.headers.get('etag') || ''),
    }
}

const getFontCatalog = async (req, res) => {
    try {
        const now = new Date()
        const forceRefresh = String(req.query.refresh || '').toLowerCase() === 'true'

        const cachedCatalog = await GoogleFontCatalog.findOne({ cacheKey: CACHE_KEY })
        const cacheIsValid = cachedCatalog?.expiresAt && new Date(cachedCatalog.expiresAt) > now

        if (!forceRefresh && cachedCatalog && cacheIsValid && Array.isArray(cachedCatalog.fonts) && cachedCatalog.fonts.length > 0) {
            return res.status(200).json({
                status: true,
                message: 'Font catalog fetched from cache',
                data: {
                    provider: cachedCatalog.provider,
                    fetchedAt: cachedCatalog.fetchedAt,
                    expiresAt: cachedCatalog.expiresAt,
                    fonts: cachedCatalog.fonts,
                },
            })
        }

        const fresh = await fetchGoogleFontCatalog()
        const nextExpiresAt = new Date(now.getTime() + CACHE_TTL_MS)

        const savedCatalog = await GoogleFontCatalog.findOneAndUpdate(
            { cacheKey: CACHE_KEY },
            {
                $set: {
                    cacheKey: CACHE_KEY,
                    provider: 'google-webfonts',
                    fonts: fresh.fonts,
                    fetchedAt: now,
                    expiresAt: nextExpiresAt,
                    etag: fresh.etag,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        )

        return res.status(200).json({
            status: true,
            message: 'Font catalog refreshed',
            data: {
                provider: savedCatalog.provider,
                fetchedAt: savedCatalog.fetchedAt,
                expiresAt: savedCatalog.expiresAt,
                fonts: savedCatalog.fonts,
            },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Unable to fetch font catalog' })
    }
}

module.exports = getFontCatalog
