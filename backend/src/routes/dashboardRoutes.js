import express from 'express';
import { getDashboardSummary, getCustomerGrowth } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Routes for dashboard data (available to owner only)
router.get('/summary', authenticate, getDashboardSummary);
router.get('/growth', authenticate, getDashboardSummary);

export default router;