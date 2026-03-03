import { Router } from 'express';
import type {} from '../core/schemas/read.js';

const router = Router();

router.get('/api/artifact', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

router.get('/api/log', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
