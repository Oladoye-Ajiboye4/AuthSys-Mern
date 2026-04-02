const cloudinary = require('../../config/cloudinary')
const EventDPDraft = require('../../models/eventDPDraft.model')

const DEFAULT_ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000
const DEFAULT_CLEANUP_INTERVAL_MS = 12 * 60 * 60 * 1000
const DELETE_BATCH_SIZE = 100

let cleanupJobStarted = false

const normalizePublicId = (publicId = '') => String(publicId).trim().replace(/^\/+|\/+$/g, '')

const isDraftFolderPublicIdForUser = (publicId, userEmail) => {
    const normalizedPublicId = normalizePublicId(publicId)
    const normalizedUserEmail = String(userEmail || '').trim().toLowerCase()

    if (!normalizedPublicId || !normalizedUserEmail) {
        return false
    }

    return normalizedPublicId.toLowerCase().startsWith(`eventdp/${normalizedUserEmail}/drafts/`)
}

const deleteCloudinaryImage = async (publicId) => {
    const normalizedPublicId = normalizePublicId(publicId)
    if (!normalizedPublicId) {
        return { status: 'skipped' }
    }

    const result = await cloudinary.uploader.destroy(normalizedPublicId, {
        invalidate: true,
        resource_type: 'image',
        type: 'upload',
    })

    const destroyResult = String(result?.result || '').toLowerCase()
    if (destroyResult === 'ok' || destroyResult === 'not found') {
        return { status: destroyResult, publicId: normalizedPublicId }
    }

    throw new Error(`Cloudinary image delete failed for ${normalizedPublicId}. Result: ${destroyResult || 'unknown'}`)
}

const chunkArray = (items, size) => {
    const chunks = []
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size))
    }
    return chunks
}

const deleteCloudinaryImagesBatch = async (publicIds = []) => {
    const uniqueIds = [...new Set(publicIds.map(normalizePublicId).filter(Boolean))]
    if (uniqueIds.length === 0) {
        return { deleted: [], failed: [] }
    }

    const deleted = []
    const failed = []
    const batches = chunkArray(uniqueIds, DELETE_BATCH_SIZE)

    for (const batch of batches) {
        try {
            const result = await cloudinary.api.delete_resources(batch, {
                resource_type: 'image',
                type: 'upload',
                invalidate: true,
            })

            const deletedMap = result?.deleted || {}
            for (const publicId of batch) {
                const status = String(deletedMap[publicId] || '').toLowerCase()
                if (status === 'deleted' || status === 'not_found') {
                    deleted.push(publicId)
                } else {
                    failed.push(publicId)
                }
            }
        } catch (error) {
            for (const publicId of batch) {
                failed.push(publicId)
            }
            console.error('[CloudinaryCleanup] Batch delete failed:', error)
        }
    }

    return { deleted, failed }
}

const getImageAgeMs = (resource) => {
    const publicId = normalizePublicId(resource?.public_id)
    const baseName = publicId.split('/').pop() || ''
    const timestampMatch = baseName.match(/^draft-(\d{13})-/)

    if (timestampMatch?.[1]) {
        const ms = Number(timestampMatch[1])
        if (Number.isFinite(ms)) {
            return Date.now() - ms
        }
    }

    const createdAt = Date.parse(resource?.created_at || '')
    if (Number.isFinite(createdAt)) {
        return Date.now() - createdAt
    }

    return null
}

const cleanupOrphanDraftImages = async ({ maxAgeMs = DEFAULT_ORPHAN_MAX_AGE_MS } = {}) => {
    let nextCursor = undefined
    let scanned = 0
    let removed = 0
    let failed = 0

    do {
        const resourcePage = await cloudinary.api.resources({
            resource_type: 'image',
            type: 'upload',
            prefix: 'eventdp/',
            max_results: 100,
            next_cursor: nextCursor,
        })

        const resources = Array.isArray(resourcePage?.resources) ? resourcePage.resources : []
        scanned += resources.length

        const oldDraftPublicIds = resources
            .map((resource) => ({
                publicId: normalizePublicId(resource?.public_id),
                ageMs: getImageAgeMs(resource),
            }))
            .filter((item) => item.publicId.includes('/drafts/'))
            .filter((item) => Number.isFinite(item.ageMs) && item.ageMs >= maxAgeMs)
            .map((item) => item.publicId)

        if (oldDraftPublicIds.length > 0) {
            const existingDrafts = await EventDPDraft.find({
                'asset.publicId': { $in: oldDraftPublicIds },
            }).select('asset.publicId').lean()

            const referencedSet = new Set(existingDrafts.map((draft) => normalizePublicId(draft?.asset?.publicId)))
            const orphanPublicIds = oldDraftPublicIds.filter((publicId) => !referencedSet.has(publicId))

            if (orphanPublicIds.length > 0) {
                const result = await deleteCloudinaryImagesBatch(orphanPublicIds)
                removed += result.deleted.length
                failed += result.failed.length
            }
        }

        nextCursor = resourcePage?.next_cursor
    } while (nextCursor)

    return { scanned, removed, failed }
}

const startCloudinaryOrphanCleanupJob = () => {
    if (cleanupJobStarted) {
        return
    }

    const enabled = String(process.env.CLOUDINARY_ORPHAN_CLEANUP_ENABLED || 'true').toLowerCase() !== 'false'
    if (!enabled) {
        return
    }

    cleanupJobStarted = true
    const maxAgeMs = Number(process.env.CLOUDINARY_ORPHAN_MAX_AGE_MS) || DEFAULT_ORPHAN_MAX_AGE_MS
    const intervalMs = Number(process.env.CLOUDINARY_ORPHAN_CLEANUP_INTERVAL_MS) || DEFAULT_CLEANUP_INTERVAL_MS
    let isRunning = false

    const runCleanup = async () => {
        if (isRunning) {
            return
        }

        isRunning = true
        try {
            const summary = await cleanupOrphanDraftImages({ maxAgeMs })
            if (summary.removed > 0 || summary.failed > 0) {
                console.log('[CloudinaryCleanup] Completed:', summary)
            }
        } catch (error) {
            console.error('[CloudinaryCleanup] Scheduled cleanup failed:', error)
        } finally {
            isRunning = false
        }
    }

    // Delay first run so startup is not blocked.
    setTimeout(runCleanup, 90 * 1000)
    setInterval(runCleanup, intervalMs)
}

module.exports = {
    isDraftFolderPublicIdForUser,
    deleteCloudinaryImage,
    deleteCloudinaryImagesBatch,
    cleanupOrphanDraftImages,
    startCloudinaryOrphanCleanupJob,
}
