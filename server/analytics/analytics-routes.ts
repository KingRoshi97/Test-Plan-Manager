import { type Express, type Request, type Response } from "express";
import { getCard, getCards, getMetric, getMetricTrend, listMetrics, listCards, getEngineHealth, refreshAllSnapshots } from "./analytics-service.js";
import { ingestEvent, ingestBatch } from "./analytics-ingest.js";
import { getAnalyticsEvents } from "./analytics-events-query.js";
import type { AnalyticsEventEnvelope } from "../../shared/analytics/event-envelope.js";

export function registerAnalyticsRoutes(app: Express): void {
  app.get("/api/analytics/cards/:cardId", async (req: Request, res: Response) => {
    try {
      const { cardId } = req.params;
      const window = req.query.window as string | undefined;
      const dimensions: Record<string, string> = {};
      for (const [key, val] of Object.entries(req.query)) {
        if (key.startsWith("dim_") && typeof val === "string") {
          dimensions[key.replace("dim_", "")] = val;
        }
      }
      const result = await getCard(cardId, window, Object.keys(dimensions).length > 0 ? dimensions : undefined);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.post("/api/analytics/cards", async (req: Request, res: Response) => {
    try {
      const { cards, include_evidence, include_lineage } = req.body;
      if (!Array.isArray(cards)) {
        return res.status(400).json({
          ok: false,
          error: { code: "INVALID_REQUEST", message: "cards must be an array" },
          meta: { request_id: "error", requested_at: new Date().toISOString() },
        });
      }
      const result = await getCards(cards);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.get("/api/analytics/metrics/:metricKey", async (req: Request, res: Response) => {
    try {
      const metricKey = req.params.metricKey;
      const window = req.query.window as string | undefined;
      const dimensions: Record<string, string> = {};
      for (const [key, val] of Object.entries(req.query)) {
        if (key.startsWith("dim_") && typeof val === "string") {
          dimensions[key.replace("dim_", "")] = val;
        }
      }
      const result = await getMetric(metricKey, window, Object.keys(dimensions).length > 0 ? dimensions : undefined);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.get("/api/analytics/metrics/:metricKey/trend", async (req: Request, res: Response) => {
    try {
      const metricKey = req.params.metricKey;
      const { start, end, granularity } = req.query as { start?: string; end?: string; granularity?: string };
      if (!start || !end || !granularity) {
        return res.status(400).json({
          ok: false,
          error: { code: "MISSING_PARAMS", message: "start, end, and granularity are required" },
          meta: { request_id: "error", requested_at: new Date().toISOString() },
        });
      }
      const result = await getMetricTrend(metricKey, start, end, granularity);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.get("/api/analytics/registry/metrics", (_req: Request, res: Response) => {
    res.json({ ok: true, data: listMetrics(), meta: { request_id: "registry", requested_at: new Date().toISOString() } });
  });

  app.get("/api/analytics/registry/cards", (_req: Request, res: Response) => {
    res.json({ ok: true, data: listCards(), meta: { request_id: "registry", requested_at: new Date().toISOString() } });
  });

  app.post("/api/analytics/ingest", async (req: Request, res: Response) => {
    try {
      const event = req.body as AnalyticsEventEnvelope;
      const result = await ingestEvent(event);
      res.status(result.accepted ? 200 : 400).json({
        ok: result.accepted,
        data: result,
        meta: { request_id: "ingest", requested_at: new Date().toISOString() },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INGEST_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.post("/api/analytics/ingest/batch", async (req: Request, res: Response) => {
    try {
      const events = req.body as AnalyticsEventEnvelope[];
      if (!Array.isArray(events)) {
        return res.status(400).json({
          ok: false,
          error: { code: "INVALID_REQUEST", message: "body must be an array of events" },
          meta: { request_id: "error", requested_at: new Date().toISOString() },
        });
      }
      const results = await ingestBatch(events);
      const allAccepted = results.every((r) => r.accepted);
      res.json({
        ok: true,
        data: { total: results.length, accepted: results.filter((r) => r.accepted).length, results },
        meta: { request_id: "ingest_batch", requested_at: new Date().toISOString() },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "INGEST_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.get("/api/analytics/health", async (_req: Request, res: Response) => {
    try {
      const health = await getEngineHealth();
      res.json({ ok: true, data: health, meta: { request_id: "health", requested_at: new Date().toISOString() } });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "HEALTH_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.get("/api/analytics/events", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
      const event_type = req.query.event_type as string | undefined;
      const domain_id = req.query.domain_id as string | undefined;
      const outcome = req.query.outcome as string | undefined;
      const start = req.query.start as string | undefined;
      const end = req.query.end as string | undefined;

      const result = await getAnalyticsEvents({ page, limit, event_type, domain_id, outcome, start, end });
      res.json({
        ok: true,
        data: result,
        meta: { request_id: "events", requested_at: new Date().toISOString() },
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "EVENTS_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });

  app.post("/api/analytics/refresh", async (_req: Request, res: Response) => {
    try {
      await refreshAllSnapshots();
      res.json({ ok: true, data: { refreshed: true }, meta: { request_id: "refresh", requested_at: new Date().toISOString() } });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: { code: "REFRESH_ERROR", message: err instanceof Error ? err.message : "Unknown error" },
        meta: { request_id: "error", requested_at: new Date().toISOString() },
      });
    }
  });
}
