const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { calculateRankings, getUserRank } = require('../utils/rankingEngine');

// POST /api/v1/user/sync - Sync Clerk user to DB after login/signup
const syncUser = async (req, res) => {
    try {
        const { email, fullName, profilePicture } = req.body;
        const isAdminEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
        const role = isAdminEmail ? 'Admin' : 'Student';

        let user = await User.findOne({ clerkId: req.userId });

        if (!user) {
            user = await User.create({ clerkId: req.userId, email, fullName, profilePicture, role });
        } else {
            user.email = email || user.email;
            // Only sync from Clerk if not already set or customized in DB
            if (!user.fullName) user.fullName = fullName;
            if (!user.profilePicture) user.profilePicture = profilePicture;
            user.role = role; // Keep role in sync
            await user.save();
        }

        const rankInfo = await getUserRank(req.userId);
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                rank: rankInfo.rank,
                resumeScore: rankInfo.resumeScore
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/user/me
const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const rankInfo = await getUserRank(req.userId);
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                rank: rankInfo.rank,
                resumeScore: rankInfo.resumeScore
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/user/rankings
const getRankings = async (req, res) => {
    try {
        const stats = await calculateRankings();
        res.json({ success: true, ...stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/v1/user/profile - Update user profile bio/links
const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, github, linkedin, profilePicture } = req.body;
        const user = await User.findOneAndUpdate(
            { clerkId: req.userId },
            { fullName, bio, github, linkedin, profilePicture },
            { new: true }
        );
        const rankInfo = await getUserRank(req.userId);
        res.json({
            success: true,
            user: {
                ...user.toObject(),
                rank: rankInfo.rank,
                resumeScore: rankInfo.resumeScore
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { syncUser, getMe, getRankings, updateProfile };
