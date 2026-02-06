import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

registerRoutes(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});