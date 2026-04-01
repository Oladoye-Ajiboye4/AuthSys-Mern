const userModel = require('../models/user.model')
const EventDPDraft = require('../models/eventDPDraft.model')
const jwt = require('jsonwebtoken')
const { z } = require('zod')

const MAX_HOST_EVENTS = 5

const dashboardQuerySchema = z.object({
    search: z.string().trim().max(80).optional(),
})

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
        const parsedQuery = dashboardQuerySchema.safeParse(req.query || {})
        const search = parsedQuery.success ? (parsedQuery.data.search || '') : ''
        const hasSearch = Boolean(search)

        userModel.findOne({ email })
            .then(async (user) => {
                if (!user) {
                    return res.status(404).json({ status: false, message: "User not found" })
                }

                const activeBaseQuery = { userEmail: email, isDeleted: { $ne: true } }
                const historyBaseQuery = { userEmail: email }
                let searchQuery = activeBaseQuery
                let historySearchQuery = historyBaseQuery

                if (hasSearch) {
                    // Prefer MongoDB text index search (inverted index) for fast lookup.
                    let textMatches = []
                    try {
                        textMatches = await EventDPDraft.find({
                            ...activeBaseQuery,
                            $text: { $search: search },
                        }).select('_id')
                    } catch (textSearchErr) {
                        textMatches = []
                    }

                    if (textMatches.length > 0) {
                        searchQuery = {
                            ...activeBaseQuery,
                            _id: { $in: textMatches.map((item) => item._id) },
                        }
                    } else {
                        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                        searchQuery = {
                            ...activeBaseQuery,
                            $or: [
                                { title: { $regex: escaped, $options: 'i' } },
                                { 'asset.originalFilename': { $regex: escaped, $options: 'i' } },
                            ],
                        }
                    }

                    historySearchQuery = {
                        ...historyBaseQuery,
                        $or: [
                            { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                            { 'asset.originalFilename': { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
                        ],
                    }
                }

                const [recentPublished, latestDrafts] = await Promise.all([
                    EventDPDraft.find({ ...searchQuery, status: 'published' })
                        .sort({ 'publish.publishedAt': -1, updatedAt: -1 })
                        .limit(6)
                        .select('title asset publish status createdAt updatedAt'),
                    EventDPDraft.find(historySearchQuery)
                        .sort({ updatedAt: -1 })
                        .limit(40)
                        .select('title status publish history asset updatedAt createdAt isDeleted'),
                ])

                const totalEventsUsed = await EventDPDraft.countDocuments(activeBaseQuery)

                const recentEventDPs = recentPublished.map((item) => ({
                    id: String(item._id),
                    name: item.title || item.asset?.originalFilename || `EventDP ${String(item._id).slice(-6)}`,
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
                            deleted: Boolean(draft.isDeleted),
                            name: draft.title || draft.asset?.originalFilename || `EventDP ${String(draft._id).slice(-6)}`,
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
                    search,
                    storage: {
                        maxEvents: MAX_HOST_EVENTS,
                        usedEvents: totalEventsUsed,
                        remainingEvents: Math.max(0, MAX_HOST_EVENTS - totalEventsUsed),
                    },
                })
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ status: false, message: "Internal server error" })
            })
    });
}

module.exports = getDashboard