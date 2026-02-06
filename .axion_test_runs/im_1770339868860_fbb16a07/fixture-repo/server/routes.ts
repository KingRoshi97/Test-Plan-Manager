import { Router } from 'express';

const router = Router();

router.get("/api/users", (req, res) => {
  res.json([]);
});

router.post("/api/users", (req, res) => {
  res.json({ id: 1 });
});

router.get("/api/posts", (req, res) => {
  res.json([]);
});

router.delete("/api/posts/:id", (req, res) => {
  res.json({ deleted: true });
});

export default router;