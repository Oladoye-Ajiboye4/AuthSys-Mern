const { z } = require('zod')
const EventDPDraft = require('../../models/eventDPDraft.model')
const {
    deleteCloudinaryImage,
    isDraftFolderPublicIdForUser,
} = require('./cloudinaryAssetCleanup')

const paramsSchema = z.object({
    draftId: z.string().min(1),
})

const deleteDraft = async (req, res) => {
    try {
        const parsed = paramsSchema.safeParse(req.params)
        if (!parsed.success) {
            return res.status(400).json({
                status: false,
                message: parsed.error.issues?.[0]?.message || 'Invalid draft id',
            })
        }

        const { draftId } = parsed.data

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })
        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        const assetPublicId = String(draft?.asset?.publicId || '').trim()
        if (assetPublicId && !isDraftFolderPublicIdForUser(assetPublicId, req.user.email)) {
            return res.status(400).json({
                status: false,
                message: 'Draft image does not belong to the authenticated user folder',
            })
        }

        // Delete cloud image first so we never orphan storage after database deletion.
        await deleteCloudinaryImage(assetPublicId)
        await EventDPDraft.deleteOne({ _id: draft._id, userEmail: req.user.email })

        return res.status(200).json({
            status: true,
            message: 'Draft and image deleted successfully',
            deletedDraftId: String(draft._id),
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = deleteDraft
