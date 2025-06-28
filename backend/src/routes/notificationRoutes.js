// filepath: d:\Code PlayGround\Water Can legder Management\backend\src\routes\notificationRoutes.js
import express from 'express';
import { 
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getAllNotifications,
  deleteNotification
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create notification - owner only
router.post('/create', authenticate, requireOwner, createNotification);

// Get user notifications - available to all authenticated users
router.get('/user', authenticate, getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', authenticate, markNotificationAsRead);

// Get all notifications - owner only
router.get('/all', authenticate, requireOwner, getAllNotifications);

// Delete notification - owner only
router.delete('/:notificationId', authenticate, requireOwner, deleteNotification);

export default router;