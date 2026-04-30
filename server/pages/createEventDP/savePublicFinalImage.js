const EventDPDraft = require('../../models/eventDPDraft.model')

const savePublicFinalImage = async (req, res) => {
    try {
        const { projectSlug, accessKey, slug } = req.params
        const finalImage = req.body?.finalImage
        const resolvedKey = accessKey || slug

        if (!resolvedKey) {
            return res.status(400).json({ status: false, message: 'Public link key is required' })
        }

        if (!finalImage || !finalImage.secureUrl || !finalImage.publicId) {
            return res.status(400).json({ status: false, message: 'Final image data is required' })
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

        if (projectSlug && draft.publish?.projectSlug && String(draft.publish.projectSlug) !== String(projectSlug)) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        if (draft.publish?.expiresAt && new Date(draft.publish.expiresAt) <= new Date()) {
            return res.status(410).json({ status: false, message: 'This EventDP link has expired' })
        }

        draft.publish = {
            ...(draft.publish || {}),
            finalImage: {
                publicId: String(finalImage.publicId),
                secureUrl: String(finalImage.secureUrl),
                width: Number(finalImage.width) || 0,
                height: Number(finalImage.height) || 0,
                format: String(finalImage.format || ''),
                bytes: Number(finalImage.bytes) || 0,
                uploadedAt: new Date(),
            },
        }

        draft.lastServerSaveAt = new Date()
        draft.history.push({
            action: 'finalized',
            at: new Date(),
            meta: {
                publicId: String(finalImage.publicId),
            },
        })

        await draft.save()

        return res.status(200).json({
            status: true,
            message: 'Final image saved successfully',
            publish: draft.publish,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = savePublicFinalImage
