const EventDPDraft = require('../../models/eventDPDraft.model')

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const fromNormalised = (normalised, asset) => {
    if (!normalised || typeof normalised !== 'object') {
        return null
    }

    const assetWidth = Math.max(1, toNumber(asset?.width, 0))
    const assetHeight = Math.max(1, toNumber(asset?.height, 0))

    const x = Math.min(1, Math.max(0, toNumber(normalised.x, 0)))
    const y = Math.min(1, Math.max(0, toNumber(normalised.y, 0)))
    const width = Math.min(1, Math.max(0, toNumber(normalised.width, 0)))
    const height = Math.min(1, Math.max(0, toNumber(normalised.height, 0)))

    return {
        x: Math.round(x * assetWidth),
        y: Math.round(y * assetHeight),
        width: Math.round(width * assetWidth),
        height: Math.round(height * assetHeight),
    }
}

const resolveZoneForGuest = (zone, asset) => {
    if (!zone || typeof zone !== 'object') {
        return null
    }

    // Priority 1: Normalised (most robust)
    // Priority 2: Actual (immutable source)
    // Priority 3: Display (fallback)
    const actual = fromNormalised(zone.normalised, asset) || zone.actual || zone.display || null
    const display = zone.display || zone.actual || null
    const normalised = zone.normalised || null

    if (!actual && !display) {
        return null
    }

    return {
        display: display || actual,
        actual: actual || display,
        normalised: normalised,
    }
}

const getPublicEventDP = async (req, res) => {
    try {
        const { slug, accessKey } = req.params
        const resolvedKey = accessKey || slug

        if (!resolvedKey) {
            return res.status(400).json({ status: false, message: 'Public link key is required' })
        }

        const draft = await EventDPDraft.findOne({
            status: 'published',
            $or: [
                { 'publish.accessKey': resolvedKey },
                { 'publish.slug': resolvedKey },
            ],
        }).select('title asset editor publish status createdAt updatedAt')

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        if (draft.publish?.expiresAt && new Date(draft.publish.expiresAt) <= new Date()) {
            return res.status(410).json({
                status: false,
                message: 'This EventDP link has expired. Please contact the host for a new link.',
            })
        }

        const eventDP = {
            _id: draft._id,
            title: draft.title,
            status: draft.status,
            asset: {
                secureUrl: draft.asset?.secureUrl,
                width: draft.asset?.width,
                height: draft.asset?.height,
                originalFilename: draft.asset?.originalFilename,
            },
            editor: {
                zoneShape: draft.editor?.zoneShape,
                committedZone: resolveZoneForGuest(draft.editor?.committedZone, draft.asset),
                textZones: Array.isArray(draft.editor?.textZones)
                    ? draft.editor.textZones.map((zone) => resolveZoneForGuest(zone, draft.asset)).filter(Boolean)
                    : [],
                allowGuestText: draft.editor?.allowGuestText,
                guestTextStyle: draft.editor?.guestTextStyle,
            },
            publish: {
                publicUrl: draft.publish?.publicUrl,
                publishedAt: draft.publish?.publishedAt,
                expiresAt: draft.publish?.expiresAt,
            },
            metrics: {
                downloadCount: Number(draft.metrics?.downloadCount || 0),
            },
            createdAt: draft.createdAt,
            updatedAt: draft.updatedAt,
        }

        return res.status(200).json({
            status: true,
            message: 'Published EventDP fetched successfully',
            eventDP,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = getPublicEventDP
