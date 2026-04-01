const EventDPDraft = require('../../models/eventDPDraft.model.js')

const unpublishEventDP = async (req, res) => {
    try {
        const { draftId } = req.params
        const userEmail = req.user?.email

        if (!draftId || !userEmail) {
            return res.status(400).json({
                status: false,
                message: 'Draft ID and user email are required',
            })
        }

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail, isDeleted: { $ne: true } })

        if (!draft) {
            return res.status(404).json({
                status: false,
                message: 'EventDP not found',
            })
        }

        if (draft.status !== 'published') {
            return res.status(400).json({
                status: false,
                message: 'Only published EventDPs can be unpublished',
            })
        }

        draft.status = 'draft'
        draft.publish = {
            projectSlug: '',
            publicUrl: '',
            expiresAt: null,
            accessKey: '',
            slug: '',
            publishedAt: null,
        }
        draft.history.push({ action: 'unpublished', at: new Date(), meta: {} })

        await draft.save()

        return res.json({
            status: true,
            message: 'EventDP unpublished successfully. You can now edit it.',
            draft,
        })
    } catch (error) {
        console.error('Error unpublishing EventDP:', error)
        return res.status(500).json({
            status: false,
            message: error?.message || 'Failed to unpublish EventDP',
        })
    }
}

module.exports = unpublishEventDP
