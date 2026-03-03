import { Router } from 'express';
import type {} from '../core/schemas/verify.js';

const router = Router();

router.post('/api/verify', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
