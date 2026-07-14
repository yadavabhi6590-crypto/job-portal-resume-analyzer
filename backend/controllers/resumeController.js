const fs = require('fs');
const pdfParse = require('pdf-parse');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const JobRole = require('../models/JobRole');
const IndustryTrend = require('../models/IndustryTrend');
const { extractSkillsFromText, matchSkills, calculateResumeScore } = require('../utils/skillMatcher');
const { generateAIFeedback } = require('../utils/aiFeedback');
const { recommendRoles } = require('../utils/roleRecommender');
const { generateImprovementPlan } = require('../utils/improvementPlan');
const { getUserRank } = require('../utils/rankingEngine');

// POST /api/v1/resume/analyze
const analyzeResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const experienceLevel = req.body.experienceLevel || 'Fresher';
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);

        // Extract text from PDF
        let rawText = '';
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            rawText = data.text;
        } else {
            rawText = fileBuffer.toString('utf-8');
        }

        // NO UNLINK - Persist file for admin viewing

        // Step 1: Extract skills
        const extractedSkills = extractSkillsFromText(rawText);

        // Step 2: Get all job roles for matching
        const jobRoles = await JobRole.find({});

        // Step 3: Calculate resume score
        const resumeScore = calculateResumeScore(rawText, extractedSkills, jobRoles.flatMap(r => r.requiredSkills));

        // Step 4: Get all required skills across all roles (global skill pool)
        const allRequiredSkills = [...new Set(jobRoles.flatMap(r => r.requiredSkills))];
        const { missing: missingSkills } = matchSkills(extractedSkills, allRequiredSkills);

        // Step 5: Industry trend analysis
        const trend = await IndustryTrend.findOne({}).sort({ updatedAt: -1 });
        let industryMatchPercent = 0;
        let highDemandMissingSkills = [];
        if (trend) {
            const { matchPercent, missing } = matchSkills(extractedSkills, trend.trendingSkills);
            industryMatchPercent = matchPercent;
            highDemandMissingSkills = missing.slice(0, 5);
        }

        // Step 6: Role recommendations
        const recommendedRoles = recommendRoles(extractedSkills, jobRoles, experienceLevel);

        // Step 7: AI feedback
        const aiFeedback = generateAIFeedback(rawText, extractedSkills, experienceLevel);

        // Step 8: 30-day plan
        const allMissing = [...new Set([...missingSkills, ...highDemandMissingSkills])];
        const improvementPlan = generateImprovementPlan(allMissing, experienceLevel);

        // Step 9: Save to DB
        const analysis = await ResumeAnalysis.create({
            userId: req.userId,
            fileName: req.file.originalname,
            resumePath: req.file.path, // Persist path
            rawText: rawText.slice(0, 5000),
            experienceLevel,
            extractedSkills,
            resumeScore,
            missingSkills: missingSkills.slice(0, 10),
            industryMatchPercent,
            highDemandMissingSkills,
            recommendedRoles,
            aiFeedback,
            improvementPlan
        });

        // Step 10: Get rank
        const rankInfo = await getUserRank(req.userId);

        res.json({
            success: true,
            analysisId: analysis._id,
            resumeScore,
            experienceLevel,
            extractedSkills,
            missingSkills: missingSkills.slice(0, 10),
            industryMatchPercent,
            highDemandMissingSkills,
            recommendedRoles,
            aiFeedback,
            improvementPlan,
            rankInfo
        });
    } catch (err) {
        console.error('Resume analysis error:', err);
        res.status(500).json({ error: 'Resume analysis failed: ' + err.message });
    }
};

// GET /api/v1/resume/history
const getResumeHistory = async (req, res) => {
    try {
        const analyses = await ResumeAnalysis.find({ userId: req.userId }).sort({ analysedAt: -1 }).limit(10);
        res.json({ success: true, analyses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/resume/latest
const getLatestAnalysis = async (req, res) => {
    try {
        const analysis = await ResumeAnalysis.findOne({ userId: req.userId }).sort({ analysedAt: -1 });
        if (!analysis) return res.status(404).json({ error: 'No analysis found' });
        const rankInfo = await getUserRank(req.userId);
        res.json({ success: true, analysis, rankInfo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { analyzeResume, getResumeHistory, getLatestAnalysis };
