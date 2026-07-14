const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeResume, getResumeHistory, getLatestAnalysis } = require('../controllers/resumeController');

router.post('/analyze', requireAuth, upload.single('resume'), analyzeResume);
router.get('/history', requireAuth, getResumeHistory);
router.get('/latest', requireAuth, getLatestAnalysis);

module.exports = router;
