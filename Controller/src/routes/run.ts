import { Router } from 'express';
import type {} from '../core/schemas/runStart.js';
import type {} from '../core/schemas/runAdvance.js';
import type {} from '../core/schemas/runStage.js';

const router = Router();

router.post('/api/run/start', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

router.post('/api/run/advance', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

router.post('/api/run/stage', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

router.post('/api/run/rerun-stage', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

router.post('/api/run/close', (_req, res) => {
  res.status(501).json({ error: 'not implemented' });
});

export default router;
