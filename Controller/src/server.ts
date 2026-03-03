import express from 'express';
import doctorRouter from './routes/doctor.js';
import runRouter from './routes/run.js';
import verifyRouter from './routes/verify.js';
import packRouter from './routes/pack.js';
import reproRouter from './routes/repro.js';
import runsReadRouter from './routes/runs_read.js';
import artifactReadRouter from './routes/artifact_read.js';

const app = express();
const PORT = 8000;
const HOST = '0.0.0.0';

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Repo-Token');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'POST') {
    const token = req.headers['x-repo-token'] as string | undefined;
    const expectedToken = process.env['REPO_TOKEN'];
    if (expectedToken && token !== expectedToken) {
      res.status(401).json({ error: 'Invalid or missing X-Repo-Token' });
      return;
    }
  }
  next();
});

app.use(doctorRouter);
app.use(runRouter);
app.use(verifyRouter);
app.use(packRouter);
app.use(reproRouter);
app.use(runsReadRouter);
app.use(artifactReadRouter);

app.listen(PORT, HOST, () => {
  console.log(`Controller listening on ${HOST}:${PORT}`);
});

export default app;
