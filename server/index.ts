import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { seedFromExistingData } from "./analytics/analytics-seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

registerRoutes(app);

seedFromExistingData().catch((err) => {
  console.error("[AAE] Seed failed:", err instanceof Error ? err.message : err);
});

const distPath = path.resolve(__dirname, "..", "App", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`AXION Dashboard API on http://0.0.0.0:${port}`);
});
