const crypto = require('crypto')
const EventDPDraft = require('../../models/eventDPDraft.model')

const generateSlug = () => crypto.randomBytes(6).toString('base64url').toLowerCase()

const buildPublicUrl = (req, slug) => {
    const publicBaseUrl = process.env.PUBLIC_WEB_BASE_URL || process.env.CLIENT_BASE_URL || `${req.protocol}://${req.get('host')}`
    return `${publicBaseUrl.replace(/\/$/, '')}/eventdp/${slug}`
}

const publishDraft = async (req, res) => {
    try {
        const { draftId } = req.params
        const { editor, baseRevision, lastClientEditAt } = req.body

        const draft = await EventDPDraft.findOne({ _id: draftId, userEmail: req.user.email })

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Draft not found' })
        }

        if (Number.isInteger(baseRevision) && baseRevision !== draft.revision) {
            return res.status(409).json({
                status: false,
                message: 'Draft version conflict. Reload latest draft.',
                revision: draft.revision,
            })
        }

        if (editor) {
            draft.editor = editor
        }

        if (draft.status !== 'published') {
            let slug = generateSlug()
            let exists = await EventDPDraft.exists({ 'publish.slug': slug })

            while (exists) {
                slug = generateSlug()
                exists = await EventDPDraft.exists({ 'publish.slug': slug })
            }

            draft.status = 'published'
            draft.publish = {
                slug,
                publicUrl: buildPublicUrl(req, slug),
                publishedAt: new Date(),
            }
            draft.history.push({
                action: 'published',
                at: new Date(),
                meta: { slug },
            })
        }

        draft.lastClientEditAt = lastClientEditAt ? new Date(lastClientEditAt) : new Date()
        draft.lastServerSaveAt = new Date()
        draft.revision += 1

        await draft.save()

        return res.status(200).json({
            status: true,
            message: 'Draft published successfully',
            draft,
            revision: draft.revision,
            publish: draft.publish,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = publishDraft
