const mongoose = require('mongoose');

const industryTrendSchema = new mongoose.Schema({
    category: { type: String, required: true },
    trendingSkills: [{ type: String }],
    highDemandRoles: [{ type: String }],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String }
});

module.exports = mongoose.model('IndustryTrend', industryTrendSchema);
