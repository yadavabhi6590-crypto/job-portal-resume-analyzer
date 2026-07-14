const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { generatePDFReport } = require('../controllers/pdfController');

router.get('/report', requireAuth, generatePDFReport);

module.exports = router;
