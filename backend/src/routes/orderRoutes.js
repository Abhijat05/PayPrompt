import express from 'express';
import { createOrder, getAllOrders, getOrderById, getUserOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Route to get user's own orders
router.get('/user', authenticate, getUserOrders);

// Protected routes that require owner role
router.get('/', authenticate, requireOwner, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, createOrder);
router.patch('/:id/status', authenticate, requireOwner, updateOrderStatus);

export default router;