const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { syncUser, getMe, getRankings, updateProfile } = require('../controllers/userController');
const JobRole = require('../models/JobRole');

const uploadAvatar = require('../middleware/uploadAvatar');

router.post('/sync', requireAuth, syncUser);
router.get('/me', requireAuth, getMe);
router.get('/rankings', requireAuth, getRankings);
router.post('/profile', requireAuth, updateProfile);
router.post('/upload-avatar', requireAuth, uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url });
});

// Public: get all job roles for selection
router.get('/roles', async (req, res) => {
    try {
        const roles = await JobRole.find({}, 'title description category requiredSkills');
        res.json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
