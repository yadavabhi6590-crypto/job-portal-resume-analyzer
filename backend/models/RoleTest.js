const mongoose = require('mongoose');

const roleTestSchema = new mongoose.Schema({
    jobRole: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole', required: true },
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String }], // exactly 4
            correctAnswer: { type: Number, required: true }, // 0-indexed
            topic: { type: String }
        }
    ],
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoleTest', roleTestSchema);
