const mongoose = require('mongoose')

const googleFontEntrySchema = new mongoose.Schema({
    family: { type: String, required: true },
    category: { type: String, default: '' },
    variants: { type: [Number], default: [] },
}, { _id: false })

const googleFontCatalogSchema = new mongoose.Schema({
    cacheKey: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: 'google-webfonts' },
    fonts: { type: [googleFontEntrySchema], default: [] },
    fetchedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    etag: { type: String, default: '' },
}, { timestamps: true })

const GoogleFontCatalog = mongoose.model('GoogleFontCatalog', googleFontCatalogSchema)

module.exports = GoogleFontCatalog
