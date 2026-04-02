const EventDPDraft = require('../../models/eventDPDraft.model')
const {
    deleteCloudinaryImage,
    isDraftFolderPublicIdForUser,
} = require('./cloudinaryAssetCleanup')

const deleteEventDP = async (req, res) => {
    try {
        const { draftId } = req.params
        const userEmail = req.user?.email

        if (!draftId || !userEmail) {
            return res.status(400).json({
                status: false,
                message: 'Draft ID and user email are required',
            })
        }

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail })

        if (!draft) {
            return res.status(404).json({
                status: false,
                message: 'EventDP not found',
            })
        }

        const assetPublicId = String(draft?.asset?.publicId || '').trim()
        if (assetPublicId && !isDraftFolderPublicIdForUser(assetPublicId, userEmail)) {
            return res.status(400).json({
                status: false,
                message: 'Draft image does not belong to the authenticated user folder',
            })
        }

        await deleteCloudinaryImage(assetPublicId)
        await EventDPDraft.findByIdAndDelete(draftId)

        return res.json({
            status: true,
            message: 'EventDP and image deleted successfully',
        })
    } catch (error) {
        console.error('Error deleting EventDP:', error)
        return res.status(500).json({
            status: false,
            message: error?.message || 'Failed to delete EventDP',
        })
    }
}

module.exports = deleteEventDP
