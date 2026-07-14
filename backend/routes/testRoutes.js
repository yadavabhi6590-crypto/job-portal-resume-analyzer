const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getTestByRole, submitTest, getUserTestResults } = require('../controllers/testController');

router.get('/:roleId', requireAuth, getTestByRole);
router.post('/submit', requireAuth, submitTest);
router.get('/', requireAuth, getUserTestResults);

module.exports = router;
