const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // clerkId
    fileName: { type: String, required: true },
    rawText: { type: String },
    experienceLevel: { type: String, enum: ['Fresher', 'Experienced'], default: 'Fresher' },
    extractedSkills: [{ type: String }],
    resumeScore: { type: Number, default: 0 },
    missingSkills: [{ type: String }],
    industryMatchPercent: { type: Number, default: 0 },
    highDemandMissingSkills: [{ type: String }],
    recommendedRoles: [
        {
            role: String,
            matchPercent: Number
        }
    ],
    aiFeedback: [{ type: String }],
    improvementPlan: [
        {
            week: Number,
            title: String,
            tasks: [String]
        }
    ],
    rank: { type: Number },
    resumePath: { type: String }, // Path to persisted PDF
    analysedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
