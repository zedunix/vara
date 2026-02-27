import express from 'express';
import { getExample, createExample } from '../controllers/exampleController';

const router = express.Router();

// Example routes
router.get('/example', getExample);
router.post('/example', createExample);

export default router;
