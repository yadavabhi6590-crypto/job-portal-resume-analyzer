const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    category: { type: String },
    createdBy: { type: String }, // clerkId of admin
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobRole', jobRoleSchema);
