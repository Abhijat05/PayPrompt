import express from 'express';
import { 
  getInventoryStatus,
  updateInventory,
  getInventoryHistory 
} from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireOwner } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get current inventory status - available to all authenticated users
router.get('/status', authenticate, getInventoryStatus);

// Update inventory - restricted to owner
router.post('/update', authenticate, requireOwner, updateInventory);

// Get inventory history - restricted to owner
router.get('/history', authenticate, requireOwner, getInventoryHistory);

export default router;