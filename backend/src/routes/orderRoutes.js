import express from 'express';
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Create a new order
router.post('/', authenticate, createOrder);

// Get orders for the authenticated user
router.get('/user/:userId', authenticate, getUserOrders);

// Get all orders (shop owner only)
router.get('/', authenticate, requireRole('owner'), getAllOrders);

// Update order status (shop owner only)
router.patch('/:orderId', authenticate, requireRole('owner'), updateOrderStatus);

export default router;