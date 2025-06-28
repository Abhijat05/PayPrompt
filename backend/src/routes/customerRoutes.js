import express from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  getCustomerProfile, 
  updateCustomerBalance,
  getTransactionHistory,
  updateCustomerProfile,
  createCustomer
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner, requireCustomer } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected route to get the authenticated user's customer profile
// This should be before the /:id route to avoid conflicts
router.get('/me', authenticate, getCustomerProfile);

// Protected routes that require owner role
router.get('/', authenticate, requireOwner, getAllCustomers);
router.get('/:id', authenticate, requireOwner, getCustomerById);

// Add the missing balance update route - update to use _id instead of clerkId
router.post('/:customerId/balance', authenticate, requireOwner, updateCustomerBalance);

// Transaction history route
router.get('/:customerId/transactions', authenticate, getTransactionHistory);

// Customer creation route
router.post('/', authenticate, requireOwner, createCustomer);

// Update customer profile
router.patch('/:customerId', authenticate, updateCustomerProfile);

export default router;