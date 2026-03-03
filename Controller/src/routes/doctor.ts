import { Router } from 'express';
import type {} from '../core/schemas/doctor.js';

const router = Router();

router.post('/api/doctor', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
