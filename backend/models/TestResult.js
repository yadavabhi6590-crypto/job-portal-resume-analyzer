const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // clerkId
    jobRole: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole', required: true },
    roleTest: { type: mongoose.Schema.Types.ObjectId, ref: 'RoleTest', required: true },
    answers: [{ type: Number }], // 0-indexed selected options
    testScore: { type: Number, default: 0 }, // raw score out of 10
    testPercent: { type: Number, default: 0 },
    knowledgeLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    weakAreas: [{ type: String }],
    resumeScore: { type: Number, default: 0 },
    careerReadinessScore: { type: Number, default: 0 }, // (resumeScore*0.7) + (testScore*10*0.3)
    takenAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', testResultSchema);
