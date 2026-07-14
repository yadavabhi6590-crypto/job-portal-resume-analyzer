/**
 * Ranking Logic
 * Calculates and assigns ranks to all users based on their latest resume score
 */

const ResumeAnalysis = require('../models/ResumeAnalysis');
const User = require('../models/User');

const calculateRankings = async () => {
    // Get all analyses, latest per user
    const allAnalyses = await ResumeAnalysis.find({}).sort({ analysedAt: -1 });
    const users = await User.find({});
    const userMap = {};
    users.forEach(u => { if (u.clerkId) userMap[u.clerkId] = u; });

    // Keep only the latest analysis per user
    const latestByUser = {};
    for (const analysis of allAnalyses) {
        if (!latestByUser[analysis.userId]) {
            latestByUser[analysis.userId] = analysis;
        }
    }

    const sorted = Object.values(latestByUser).sort((a, b) => b.resumeScore - a.resumeScore);

    const stats = {
        totalUsers: sorted.length,
        averageScore: sorted.length > 0
            ? Math.round(sorted.reduce((sum, a) => sum + a.resumeScore, 0) / sorted.length)
            : 0,
        topScore: sorted.length > 0 ? sorted[0].resumeScore : 0,
        rankings: sorted.map((a, idx) => ({
            userId: a.userId,
            fullName: userMap[a.userId]?.fullName || 'Anonymous',
            rank: idx + 1,
            resumeScore: a.resumeScore,
            fileName: a.fileName,
            resumePath: a.resumePath,
            analysisId: a._id,
            analysedAt: a.analysedAt
        }))
    };

    return stats;
};

const getUserRank = async (userId) => {
    const stats = await calculateRankings();
    const user = stats.rankings.find(r => r.userId === userId);
    return {
        rank: user ? user.rank : null,
        resumeScore: user ? user.resumeScore : 0,
        totalUsers: stats.totalUsers,
        averageScore: stats.averageScore,
        topScore: stats.topScore
    };
};

module.exports = { calculateRankings, getUserRank };
