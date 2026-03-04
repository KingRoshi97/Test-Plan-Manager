import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  registerRoutes(app);

  const vite = await createViteServer({
    root: path.resolve(__dirname, "..", "App"),
    server: { middlewareMode: true, hmr: { port: 5173 } },
    appType: "spa",
  });

  app.use(vite.middlewares);

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`AXION Dev Server on http://0.0.0.0:${port}`);
  });
}

start().catch(console.error);
