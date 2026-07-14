const RoleTest = require('../models/RoleTest');
const TestResult = require('../models/TestResult');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const JobRole = require('../models/JobRole');

// GET /api/v1/test/:roleId - get test for a specific role
const getTestByRole = async (req, res) => {
    try {
        const test = await RoleTest.findOne({ jobRole: req.params.roleId }).populate('jobRole', 'title');
        if (!test) return res.status(404).json({ error: 'No test found for this role' });

        // Strip correct answers before sending to client
        const safeQuestions = test.questions.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            topic: q.topic
        }));

        res.json({ success: true, testId: test._id, jobRole: test.jobRole, questions: safeQuestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/v1/test/submit
const submitTest = async (req, res) => {
    try {
        const { testId, roleId, answers } = req.body;
        if (!testId || !roleId || !answers) {
            return res.status(400).json({ error: 'testId, roleId, and answers are required' });
        }

        const test = await RoleTest.findById(testId);
        if (!test) return res.status(404).json({ error: 'Test not found' });

        // Calculate score
        let correct = 0;
        const weakAreas = new Set();
        test.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                correct++;
            } else {
                if (q.topic) weakAreas.add(q.topic);
            }
        });

        const testScore = correct; // out of 10
        const testPercent = Math.round((correct / test.questions.length) * 100);

        let knowledgeLevel = 'Beginner';
        if (testPercent >= 80) knowledgeLevel = 'Advanced';
        else if (testPercent >= 50) knowledgeLevel = 'Intermediate';

        // Get resume score for career readiness
        const latestResume = await ResumeAnalysis.findOne({ userId: req.userId }).sort({ analysedAt: -1 });
        const resumeScore = latestResume ? latestResume.resumeScore : 0;

        // Career Readiness Formula: (resumeScore × 0.7) + (testPercent × 0.3)
        const careerReadinessScore = Math.round((resumeScore * 0.7) + (testPercent * 0.3));

        const result = await TestResult.create({
            userId: req.userId,
            jobRole: roleId,
            roleTest: testId,
            answers,
            testScore,
            testPercent,
            knowledgeLevel,
            weakAreas: Array.from(weakAreas),
            resumeScore,
            careerReadinessScore
        });

        res.json({
            success: true,
            resultId: result._id,
            testScore,
            testPercent,
            knowledgeLevel,
            weakAreas: Array.from(weakAreas),
            resumeScore,
            careerReadinessScore,
            correct,
            total: test.questions.length
        });
    } catch (err) {
        console.error('Test submission error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/test/results - get all test results for logged in user
const getUserTestResults = async (req, res) => {
    try {
        const results = await TestResult.find({ userId: req.userId })
            .populate('jobRole', 'title')
            .sort({ takenAt: -1 });
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTestByRole, submitTest, getUserTestResults };
