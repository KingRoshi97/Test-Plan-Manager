import { Router } from 'express';
import type {} from '../core/schemas/pack.js';

const router = Router();

router.post('/api/pack', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
