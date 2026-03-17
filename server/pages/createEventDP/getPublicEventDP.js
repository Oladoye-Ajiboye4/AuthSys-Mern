const EventDPDraft = require('../../models/eventDPDraft.model')

const getPublicEventDP = async (req, res) => {
    try {
        const { slug } = req.params

        const draft = await EventDPDraft.findOne({
            status: 'published',
            'publish.slug': slug,
        }).select('asset editor publish status createdAt updatedAt')

        if (!draft) {
            return res.status(404).json({ status: false, message: 'Published EventDP not found' })
        }

        return res.status(200).json({
            status: true,
            message: 'Published EventDP fetched successfully',
            eventDP: draft,
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: false, message: 'Internal server error' })
    }
}

module.exports = getPublicEventDP
