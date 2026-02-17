import express from "express";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDev() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: false, limit: '50mb' }));

  registerRoutes(app);

  const server = createServer(app);

  const viteConfigPath = path.resolve(__dirname, "..", "client", "vite.config.ts");
  const hasViteConfig = fs.existsSync(viteConfigPath);

  if (hasViteConfig) {
    const vite = await createViteServer({
      configFile: viteConfigPath,
      server: { middlewareMode: true, hmr: { server } },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.use("/{*splat}", async (req, res, next) => {
      try {
        const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "..", "dist", "public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("/{*splat}", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`AXION Dashboard running on http://0.0.0.0:${port}`);
  });
}

startDev().catch(console.error);
