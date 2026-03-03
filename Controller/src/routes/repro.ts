import { Router } from 'express';
import type {} from '../core/schemas/repro.js';

const router = Router();

router.post('/api/repro', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
