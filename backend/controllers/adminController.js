const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const JobRole = require('../models/JobRole');
const IndustryTrend = require('../models/IndustryTrend');
const RoleTest = require('../models/RoleTest');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const TestResult = require('../models/TestResult');
const { calculateRankings } = require('../utils/rankingEngine');

// ── JOB ROLES ──────────────────────────────────────────────────────────────

// GET /api/v1/admin/roles
const getAllRoles = async (req, res) => {
    const roles = await JobRole.find({}).sort({ createdAt: -1 });
    res.json({ success: true, roles });
};

// POST /api/v1/admin/roles
const createRole = async (req, res) => {
    try {
        const { title, description, requiredSkills, category } = req.body;
        const role = await JobRole.create({ title, description, requiredSkills, category, createdBy: req.userId });
        res.status(201).json({ success: true, role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/v1/admin/roles/:id
const updateRole = async (req, res) => {
    try {
        const role = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/v1/admin/roles/:id
const deleteRole = async (req, res) => {
    await JobRole.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Role deleted' });
};

// ── INDUSTRY TRENDS ────────────────────────────────────────────────────────

// GET /api/v1/admin/trends
const getAllTrends = async (req, res) => {
    const trends = await IndustryTrend.find({});
    res.json({ success: true, trends });
};

// POST /api/v1/admin/trends
const createTrend = async (req, res) => {
    try {
        const { category, trendingSkills, highDemandRoles } = req.body;
        const trend = await IndustryTrend.create({ category, trendingSkills, highDemandRoles, updatedBy: req.userId });
        res.status(201).json({ success: true, trend });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/v1/admin/trends/:id
const updateTrend = async (req, res) => {
    try {
        const trend = await IndustryTrend.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
        res.json({ success: true, trend });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ── QUESTIONS ──────────────────────────────────────────────────────────────

// GET /api/v1/admin/tests
const getAllTests = async (req, res) => {
    const tests = await RoleTest.find({}).populate('jobRole', 'title');
    res.json({ success: true, tests });
};

// POST /api/v1/admin/tests
const createTest = async (req, res) => {
    try {
        const { jobRole, questions } = req.body;
        const test = await RoleTest.create({ jobRole, questions, createdBy: req.userId });
        res.status(201).json({ success: true, test });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/v1/admin/tests/:id
const updateTest = async (req, res) => {
    try {
        const test = await RoleTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, test });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ── ANALYTICS ──────────────────────────────────────────────────────────────

// GET /api/v1/admin/analytics
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAnalyses = await ResumeAnalysis.countDocuments();
        const totalTests = await TestResult.countDocuments();
        const rankings = await calculateRankings();

        res.json({
            success: true,
            totalUsers,
            totalAnalyses,
            totalTests,
            averageResumeScore: rankings.averageScore,
            topResumeScore: rankings.topScore,
            rankingList: rankings.rankings
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/admin/resume/:id - View a user's resume
const viewUserResume = async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findById(req.params.id);
        if (!analysis || !analysis.resumePath) {
            return res.status(404).json({ error: 'Resume file not found or not persisted' });
        }

        const fullPath = path.resolve(analysis.resumePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Resume file missing from storage' });
        }

        res.sendFile(fullPath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllRoles, createRole, updateRole, deleteRole,
    getAllTrends, createTrend, updateTrend,
    getAllTests, createTest, updateTest,
    getAnalytics, viewUserResume
};
