import express from 'express';
import { getAllCustomers, getCustomerById, getCustomerProfile } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner, requireCustomer } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected route to get the authenticated user's customer profile
// This should be before the /:id route to avoid conflicts
router.get('/me', authenticate, getCustomerProfile);

// Protected routes that require owner role
router.get('/', authenticate, requireOwner, getAllCustomers);
router.get('/:id', authenticate, requireOwner, getCustomerById);

export default router;