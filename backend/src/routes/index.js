import express from 'express';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

router.use('/orders', orderRoutes);

export default router;