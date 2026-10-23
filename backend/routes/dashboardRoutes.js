const express = require('express');
const router = express.Router();
const { getDashboardSummary, getProfitLossReport } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getDashboardSummary);
router.get('/profit-loss', protect, getProfitLossReport);

module.exports = router;
