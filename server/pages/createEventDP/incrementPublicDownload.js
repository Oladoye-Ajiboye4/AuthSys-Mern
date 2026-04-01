const EventDPDraft = require('../../models/eventDPDraft.model')

const incrementPublicDownload = async (req, res) => {
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
        })

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        if (draft.publish?.expiresAt && new Date(draft.publish.expiresAt) <= new Date()) {
            return res.status(410).json({ status: false, message: 'This EventDP link has expired' })
        }

        draft.metrics = {
            ...(draft.metrics || {}),
            downloadCount: Number(draft.metrics?.downloadCount || 0) + 1,
        }

        await draft.save()

        return res.status(200).json({
            status: true,
            message: 'Download metric saved',
            downloadCount: draft.metrics.downloadCount,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = incrementPublicDownload
