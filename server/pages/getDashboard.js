const userModel = require('../models/user.model')
const EventDPDraft = require('../models/eventDPDraft.model')
const jwt = require('jsonwebtoken')

const getDashboard = (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        console.log('Authorization header', authHeader)
        return res.status(401).json({ status: false, message: "Authorization header is missing" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({ status: false, message: "Token is missing" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ status: false, message: "Token is expired or invalid" })
        }

        console.log(result);
        const email = result.email
        userModel.findOne({ email })
            .then(async (user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }

                const [recentPublished, latestDrafts] = await Promise.all([
                    EventDPDraft.find({ userEmail: email, status: 'published' })
                        .sort({ 'publish.publishedAt': -1, updatedAt: -1 })
                        .limit(6)
                        .select('asset publish status createdAt updatedAt'),
                    EventDPDraft.find({ userEmail: email })
                        .sort({ updatedAt: -1 })
                        .limit(20)
                        .select('status publish history asset updatedAt createdAt'),
                ])

                const recentEventDPs = recentPublished.map((item) => ({
                    id: String(item._id),
                    name: item.asset?.originalFilename || `EventDP ${String(item._id).slice(-6)}`,
                    date: item.publish?.publishedAt || item.createdAt,
                    status: item.status,
                    image: item.asset?.secureUrl || '',
                    publicUrl: item.publish?.publicUrl || '',
                    slug: item.publish?.slug || '',
                }))

                const eventHistory = latestDrafts
                    .flatMap((draft) => {
                        const baseHistory = Array.isArray(draft.history) ? draft.history : []
                        return baseHistory.map((entry) => ({
                            id: `${draft._id}-${entry.action}-${new Date(entry.at).getTime()}`,
                            draftId: String(draft._id),
                            action: entry.action,
                            at: entry.at,
                            status: draft.status,
                            name: draft.asset?.originalFilename || `EventDP ${String(draft._id).slice(-6)}`,
                            publicUrl: draft.publish?.publicUrl || '',
                        }))
                    })
                    .sort((a, b) => new Date(b.at) - new Date(a.at))
                    .slice(0, 12)

                return res.status(200).json({
                    status: true,
                    message: "Token is valid",
                    user,
                    recentEventDPs,
                    eventHistory,
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ status: false, message: "Internal server error" })
            })
    });
}

module.exports = getDashboard