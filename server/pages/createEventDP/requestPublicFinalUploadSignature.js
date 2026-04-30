const cloudinary = require('../../config/cloudinary')
const EventDPDraft = require('../../models/eventDPDraft.model')

const toSafeSegment = (value = 'eventdp-final') => String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'eventdp-final'

const requestPublicFinalUploadSignature = async (req, res) => {
    try {
        const { projectSlug, accessKey, slug } = req.params
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

        if (projectSlug && draft.publish?.projectSlug && String(draft.publish.projectSlug) !== String(projectSlug)) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        if (draft.publish?.expiresAt && new Date(draft.publish.expiresAt) <= new Date()) {
            return res.status(410).json({ status: false, message: 'This EventDP link has expired' })
        }

        const cloudinaryConfig = cloudinary.config()
        const timestamp = Math.round(Date.now() / 1000)
        const hostFolder = `eventdp/${toSafeSegment(draft.userEmail)}/projects/${toSafeSegment(draft.publish?.projectSlug || projectSlug || resolvedKey)}/finals`
        const publicId = `final-${Date.now()}-${toSafeSegment(draft.title || draft.asset?.originalFilename || 'eventdp')}`

        const signature = cloudinary.utils.api_sign_request(
            { folder: hostFolder, public_id: publicId, timestamp },
            cloudinaryConfig.api_secret,
        )

        return res.status(200).json({
            status: true,
            message: 'Final upload signature generated',
            data: {
                cloudName: cloudinaryConfig.cloud_name,
                apiKey: cloudinaryConfig.api_key,
                timestamp,
                signature,
                folder: hostFolder,
                publicId,
            },
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = requestPublicFinalUploadSignature
