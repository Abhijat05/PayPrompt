import express from 'express';
import { getAllItems } from '../controllers/index.js';

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Example route
router.get('/example', getAllItems);

export default router;