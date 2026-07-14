const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminGuard');
const {
    getAllRoles, createRole, updateRole, deleteRole,
    getAllTrends, createTrend, updateTrend,
    getAllTests, createTest, updateTest,
    getAnalytics, viewUserResume
} = require('../controllers/adminController');

// All admin routes are protected
router.use(requireAuth, requireAdmin);

// Roles
router.get('/roles', getAllRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// Trends
router.get('/trends', getAllTrends);
router.post('/trends', createTrend);
router.put('/trends/:id', updateTrend);

// Tests
router.get('/tests', getAllTests);
router.post('/tests', createTest);
router.put('/tests/:id', updateTest);

// Analytics
router.get('/analytics', getAnalytics);

// View User Resume
router.get('/resume/:id', viewUserResume);

module.exports = router;
