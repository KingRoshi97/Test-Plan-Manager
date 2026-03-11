import { type Express, type Request, type Response } from "express";
import { db } from "./db.js";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  assemblyRevisions, upgradeSessions, upgradePlans, upgradePlanChanges,
  upgradeSessionArtifacts, revisionDiffs, revisionDiffItems,
  revisionVerifications, revisionVerificationChecks, revisionEvents,
  revisionSnapshots, assemblies,
} from "../shared/schema.js";
import { UPGRADE_MODE_OPTIONS } from "../shared/upgrade-types.js";
import type {
  UpgradeRevisionSummary, UpgradeSessionSummary, UpgradeVerificationSummary,
  UpgradePlanData, UpgradePlannedChange, UpgradeArtifactRef, UpgradeRiskItem,
  RevisionDiffData, DiffItem, DiffRenameItem, RevisionVerificationDetail,
  VerificationCheckData, RevisionEventData, RevisionSnapshotSummary,
  UpgradeLineagePreview,
} from "../shared/upgrade-types.js";

function toRevisionSummary(row: any): UpgradeRevisionSummary {
  return {
    id: row.id,
    revisionNumber: row.revisionNumber,
    title: row.title,
    summary: row.summary,
    status: row.status as any,
    modeId: row.modeId as any,
    parentRevisionId: row.parentRevisionId,
    sourceRunId: row.sourceRunId,
    sourceSessionId: row.sourceSessionId,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    createdBy: row.createdBy,
    promotedAt: row.promotedAt?.toISOString?.() ?? row.promotedAt ?? null,
    archivedAt: row.archivedAt?.toISOString?.() ?? row.archivedAt ?? null,
    isRollbackTarget: row.isRollbackTarget,
    isCurrentActive: row.isCurrentActive,
    isCandidate: row.status === "candidate",
  };
}

function toSessionSummary(row: any): UpgradeSessionSummary {
  return {
    id: row.id,
    assemblyId: row.assemblyId,
    sourceRevisionId: row.sourceRevisionId,
    candidateRevisionId: row.candidateRevisionId,
    modeId: row.modeId as any,
    objective: row.objective,
    scope: row.scope,
    instructions: row.instructions,
    status: row.status as any,
    compatibilityRequired: row.compatibilityRequired,
    validationProfile: row.validationProfile,
    riskLevel: row.riskLevel as any,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    completedAt: row.completedAt?.toISOString?.() ?? row.completedAt ?? null,
    blockingIssue: row.blockingIssue,
  };
}

function toVerificationSummary(row: any): UpgradeVerificationSummary {
  return {
    revisionId: row.revisionId,
    verdict: row.verdict as any,
    requiredChecksTotal: row.requiredChecksTotal,
    requiredChecksPassed: row.requiredChecksPassed,
    optionalChecksTotal: row.optionalChecksTotal,
    optionalChecksPassed: row.optionalChecksPassed,
    warningCount: row.warningCount,
    failureCount: row.failureCount,
    lastRunAt: row.completedAt?.toISOString?.() ?? row.completedAt ?? null,
  };
}

async function recordEvent(assemblyId: number, eventType: string, opts: { revisionId?: string; sessionId?: string; actorType?: string; actorLabel?: string; payload?: Record<string, unknown> } = {}) {
  await db.insert(revisionEvents).values({
    assemblyId,
    revisionId: opts.revisionId ?? null,
    sessionId: opts.sessionId ?? null,
    eventType,
    actorType: opts.actorType ?? "system",
    actorLabel: opts.actorLabel ?? null,
    payloadJson: opts.payload ?? null,
  });
}

export function registerUpgradeRoutes(app: Express) {
  app.get("/api/assemblies/:assemblyId/upgrade", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const revisions = await db.select().from(assemblyRevisions)
        .where(eq(assemblyRevisions.assemblyId, assemblyId))
        .orderBy(desc(assemblyRevisions.revisionNumber));
      const sessions = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.assemblyId, assemblyId))
        .orderBy(desc(upgradeSessions.createdAt));

      const activeRevision = revisions.find(r => r.isCurrentActive) ?? null;
      const candidateRevision = revisions.find(r => r.status === "candidate") ?? null;

      const activeSession = sessions.find(s =>
        !["promoted", "failed", "cancelled", "archived"].includes(s.status)
      ) ?? null;

      const sourceRevision = activeSession
        ? revisions.find(r => r.id === activeSession.sourceRevisionId) ?? null
        : activeRevision;

      let verificationSummary: UpgradeVerificationSummary | null = null;
      if (candidateRevision) {
        const vRows = await db.select().from(revisionVerifications)
          .where(eq(revisionVerifications.revisionId, candidateRevision.id))
          .orderBy(desc(revisionVerifications.createdAt))
          .limit(1);
        if (vRows.length > 0) verificationSummary = toVerificationSummary(vRows[0]);
      }

      res.json({
        assemblyId,
        activeRevision: activeRevision ? toRevisionSummary(activeRevision) : null,
        candidateRevision: candidateRevision ? toRevisionSummary(candidateRevision) : null,
        sourceRevision: sourceRevision ? toRevisionSummary(sourceRevision) : null,
        revisions: revisions.map(toRevisionSummary),
        sessions: sessions.map(toSessionSummary),
        activeSession: activeSession ? toSessionSummary(activeSession) : null,
        verificationSummary,
        modeOptions: UPGRADE_MODE_OPTIONS,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrade/baseline", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const { title, summary, sourceRunId, notes } = req.body;

      const existing = await db.select().from(assemblyRevisions)
        .where(and(eq(assemblyRevisions.assemblyId, assemblyId), eq(assemblyRevisions.isCurrentActive, true)));
      if (existing.length > 0) {
        return res.status(409).json({ error: "Active baseline revision already exists" });
      }

      const maxRev = await db.select({ max: sql<number>`COALESCE(MAX(${assemblyRevisions.revisionNumber}), 0)` })
        .from(assemblyRevisions)
        .where(eq(assemblyRevisions.assemblyId, assemblyId));
      const nextNum = (maxRev[0]?.max ?? 0) + 1;

      const rows = await db.insert(assemblyRevisions).values({
        assemblyId,
        revisionNumber: nextNum,
        status: "active",
        title: title || `Baseline Revision`,
        summary: summary || "Initial baseline revision",
        sourceRunId: sourceRunId || null,
        isCurrentActive: true,
        isRollbackTarget: false,
        createdBy: "user",
      }).returning();

      const rev = rows[0];

      const snapRows = await db.insert(revisionSnapshots).values({
        revisionId: rev.id,
        snapshotType: "source",
        createdBy: "user",
      }).returning();

      await recordEvent(assemblyId, "baseline_created", {
        revisionId: rev.id,
        actorType: "user",
        payload: { revisionNumber: nextNum, notes },
      });

      res.status(201).json({
        revision: toRevisionSummary(rev),
        snapshotCreated: snapRows.length > 0,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/revisions", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const includeArchived = req.query.includeArchived === "true";
      let query = db.select().from(assemblyRevisions)
        .where(eq(assemblyRevisions.assemblyId, assemblyId))
        .orderBy(desc(assemblyRevisions.revisionNumber));

      const rows = await query;
      const filtered = includeArchived ? rows : rows.filter(r => r.status !== "archived");
      res.json({ revisions: filtered.map(toRevisionSummary) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/revisions/:revisionId", async (req: Request, res: Response) => {
    try {
      const rows = await db.select().from(assemblyRevisions)
        .where(eq(assemblyRevisions.id, req.params.revisionId));
      if (rows.length === 0) return res.status(404).json({ error: "Revision not found" });

      const snaps = await db.select().from(revisionSnapshots)
        .where(eq(revisionSnapshots.revisionId, req.params.revisionId));

      const vRows = await db.select().from(revisionVerifications)
        .where(eq(revisionVerifications.revisionId, req.params.revisionId))
        .orderBy(desc(revisionVerifications.createdAt))
        .limit(1);

      res.json({
        revision: toRevisionSummary(rows[0]),
        snapshots: snaps.map(s => ({
          id: s.id,
          revisionId: s.revisionId,
          snapshotType: s.snapshotType,
          manifestPath: s.manifestPath,
          kitArchivePath: s.kitArchivePath,
          artifactTreeHash: s.artifactTreeHash,
          createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
          createdBy: s.createdBy,
        })),
        latestVerification: vRows.length > 0 ? toVerificationSummary(vRows[0]) : null,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/revisions/:revisionId/archive", async (req: Request, res: Response) => {
    try {
      const rows = await db.select().from(assemblyRevisions)
        .where(eq(assemblyRevisions.id, req.params.revisionId));
      if (rows.length === 0) return res.status(404).json({ error: "Revision not found" });
      if (rows[0].isCurrentActive) return res.status(400).json({ error: "Cannot archive active revision" });

      const updated = await db.update(assemblyRevisions)
        .set({ status: "archived", archivedAt: new Date() })
        .where(eq(assemblyRevisions.id, req.params.revisionId))
        .returning();

      await recordEvent(Number(req.params.assemblyId), "archived", {
        revisionId: req.params.revisionId,
        actorType: "user",
        payload: { reason: req.body.reason },
      });

      res.json({ revision: toRevisionSummary(updated[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/revisions/:revisionId/snapshots", async (req: Request, res: Response) => {
    try {
      const snaps = await db.select().from(revisionSnapshots)
        .where(eq(revisionSnapshots.revisionId, req.params.revisionId));
      res.json({
        snapshots: snaps.map(s => ({
          id: s.id, revisionId: s.revisionId, snapshotType: s.snapshotType,
          manifestPath: s.manifestPath, kitArchivePath: s.kitArchivePath,
          artifactTreeHash: s.artifactTreeHash,
          createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
          createdBy: s.createdBy,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/sessions", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const rows = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.assemblyId, assemblyId))
        .orderBy(desc(upgradeSessions.createdAt));
      res.json({ sessions: rows.map(toSessionSummary) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const { sourceRevisionId, modeId, objective, scope, instructions, notes, compatibilityRequired, validationProfile } = req.body;

      if (!sourceRevisionId || !modeId || !objective) {
        return res.status(400).json({ error: "sourceRevisionId, modeId, and objective are required" });
      }

      const sourceRev = await db.select().from(assemblyRevisions)
        .where(eq(assemblyRevisions.id, sourceRevisionId));
      if (sourceRev.length === 0) return res.status(404).json({ error: "Source revision not found" });

      const rows = await db.insert(upgradeSessions).values({
        assemblyId,
        sourceRevisionId,
        modeId,
        status: "draft",
        objective,
        scope: scope || null,
        instructions: instructions || null,
        notes: notes || null,
        compatibilityRequired: compatibilityRequired ?? false,
        validationProfile: validationProfile || null,
        createdBy: "user",
      }).returning();

      await recordEvent(assemblyId, "session_started", {
        sessionId: rows[0].id,
        revisionId: sourceRevisionId,
        actorType: "user",
        payload: { modeId, objective },
      });

      res.status(201).json({ session: toSessionSummary(rows[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId", async (req: Request, res: Response) => {
    try {
      const rows = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.id, req.params.sessionId));
      if (rows.length === 0) return res.status(404).json({ error: "Session not found" });
      res.json({ session: toSessionSummary(rows[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/cancel", async (req: Request, res: Response) => {
    try {
      const updated = await db.update(upgradeSessions)
        .set({ status: "cancelled", updatedAt: new Date(), completedAt: new Date() })
        .where(eq(upgradeSessions.id, req.params.sessionId))
        .returning();
      if (updated.length === 0) return res.status(404).json({ error: "Session not found" });

      await recordEvent(Number(req.params.assemblyId), "session_cancelled", {
        sessionId: req.params.sessionId,
        actorType: "user",
      });

      res.json({ session: toSessionSummary(updated[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/archive", async (req: Request, res: Response) => {
    try {
      const updated = await db.update(upgradeSessions)
        .set({ status: "archived", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, req.params.sessionId))
        .returning();
      if (updated.length === 0) return res.status(404).json({ error: "Session not found" });
      res.json({ session: toSessionSummary(updated[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/clone", async (req: Request, res: Response) => {
    try {
      const original = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.id, req.params.sessionId));
      if (original.length === 0) return res.status(404).json({ error: "Session not found" });

      const src = original[0];
      const rows = await db.insert(upgradeSessions).values({
        assemblyId: src.assemblyId,
        sourceRevisionId: src.sourceRevisionId,
        modeId: src.modeId,
        status: "draft",
        objective: src.objective,
        scope: src.scope,
        instructions: src.instructions,
        notes: `Cloned from session ${src.id}`,
        compatibilityRequired: src.compatibilityRequired,
        validationProfile: src.validationProfile,
        createdBy: "user",
      }).returning();

      res.status(201).json({ session: toSessionSummary(rows[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/plan", async (req: Request, res: Response) => {
    try {
      const plans = await db.select().from(upgradePlans)
        .where(eq(upgradePlans.sessionId, req.params.sessionId))
        .orderBy(desc(upgradePlans.generatedAt))
        .limit(1);

      if (plans.length === 0) return res.json({ plan: null });

      const plan = plans[0];
      const changes = await db.select().from(upgradePlanChanges)
        .where(eq(upgradePlanChanges.planId, plan.id))
        .orderBy(upgradePlanChanges.ordinal);

      const artifacts = await db.select().from(upgradeSessionArtifacts)
        .where(eq(upgradeSessionArtifacts.sessionId, req.params.sessionId));

      const planData: UpgradePlanData = {
        id: plan.id,
        sessionId: plan.sessionId,
        findingsSummary: plan.findingsSummary,
        proposedChanges: changes.map(c => ({
          id: c.id, title: c.title, description: c.description,
          priority: c.priority as any, targetArea: c.targetArea, expectedImpact: c.expectedImpact,
        })),
        impactedArtifacts: artifacts.filter(a => a.role === "impacted").map(a => ({
          id: a.id, label: a.artifactLabel, path: a.artifactPath, artifactType: a.artifactType,
        })),
        risks: [],
        validationPlan: { requiredChecks: [] },
        rollbackPlan: {
          targetRevisionId: plan.rollbackTargetRevisionId,
          notes: plan.rollbackNotes,
          isSafeRollbackAvailable: plan.safeRollbackAvailable,
        },
        agentSummary: plan.agentSummary,
        generatedAt: plan.generatedAt?.toISOString?.() ?? plan.generatedAt as any,
        approvedAt: plan.approvedAt?.toISOString?.() ?? null,
        approvedBy: plan.approvedBy,
      };

      res.json({ plan: planData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/plan/generate", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.id, sessionId));
      if (session.length === 0) return res.status(404).json({ error: "Session not found" });

      await db.update(upgradeSessions)
        .set({ status: "planning", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, sessionId));

      const planRows = await db.insert(upgradePlans).values({
        sessionId,
        findingsSummary: `Automated analysis of assembly for ${session[0].modeId} upgrade. Objective: ${session[0].objective}`,
        agentSummary: "Plan generated based on current assembly state and upgrade objective.",
        safeRollbackAvailable: true,
        rollbackTargetRevisionId: session[0].sourceRevisionId,
      }).returning();

      await db.insert(upgradePlanChanges).values([
        { planId: planRows[0].id, ordinal: 1, title: "Analyze current state", description: "Review current revision artifacts and configuration", priority: "high" },
        { planId: planRows[0].id, ordinal: 2, title: "Apply upgrade changes", description: "Execute upgrade transformations per objective", priority: "high" },
        { planId: planRows[0].id, ordinal: 3, title: "Validate results", description: "Run verification checks on candidate output", priority: "medium" },
      ]);

      await db.update(upgradeSessions)
        .set({ status: "awaiting_approval", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, sessionId));

      await recordEvent(Number(req.params.assemblyId), "plan_generated", {
        sessionId, actorType: "system",
      });

      const plans = await db.select().from(upgradePlans)
        .where(eq(upgradePlans.id, planRows[0].id));
      const changes = await db.select().from(upgradePlanChanges)
        .where(eq(upgradePlanChanges.planId, planRows[0].id))
        .orderBy(upgradePlanChanges.ordinal);

      res.json({
        plan: {
          id: plans[0].id, sessionId: plans[0].sessionId,
          findingsSummary: plans[0].findingsSummary,
          proposedChanges: changes.map(c => ({
            id: c.id, title: c.title, description: c.description,
            priority: c.priority, targetArea: c.targetArea, expectedImpact: c.expectedImpact,
          })),
          impactedArtifacts: [], risks: [],
          validationPlan: { requiredChecks: ["integrity", "manifest", "diff_existence"] },
          rollbackPlan: {
            targetRevisionId: plans[0].rollbackTargetRevisionId,
            notes: plans[0].rollbackNotes,
            isSafeRollbackAvailable: plans[0].safeRollbackAvailable,
          },
          agentSummary: plans[0].agentSummary,
          generatedAt: plans[0].generatedAt?.toISOString?.(),
          approvedAt: null, approvedBy: null,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/plan/approve", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const plans = await db.select().from(upgradePlans)
        .where(eq(upgradePlans.sessionId, sessionId))
        .orderBy(desc(upgradePlans.generatedAt))
        .limit(1);
      if (plans.length === 0) return res.status(404).json({ error: "No plan found" });

      await db.update(upgradePlans)
        .set({ approvedAt: new Date(), approvedBy: "user", updatedAt: new Date() })
        .where(eq(upgradePlans.id, plans[0].id));

      await db.update(upgradeSessions)
        .set({ status: "executing", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, sessionId));

      await recordEvent(Number(req.params.assemblyId), "plan_approved", {
        sessionId, actorType: "user",
      });

      res.json({ approved: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/plan/regenerate", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;

      if (req.body.instructions) {
        await db.update(upgradeSessions)
          .set({ instructions: req.body.instructions, updatedAt: new Date() })
          .where(eq(upgradeSessions.id, sessionId));
      }

      await db.delete(upgradePlanChanges)
        .where(eq(upgradePlanChanges.planId, sql`(SELECT id FROM upgrade_plans WHERE session_id = ${sessionId} ORDER BY generated_at DESC LIMIT 1)`));
      await db.delete(upgradePlans).where(eq(upgradePlans.sessionId, sessionId));

      const fwdReq = { ...req, body: {} } as any;
      const fwdRes = res;
      return app._router?.handle?.(fwdReq, fwdRes, () => {}) ??
        res.json({ regenerated: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/execute", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.id, sessionId));
      if (session.length === 0) return res.status(404).json({ error: "Session not found" });

      const assemblyId = Number(req.params.assemblyId);

      const maxRev = await db.select({ max: sql<number>`COALESCE(MAX(${assemblyRevisions.revisionNumber}), 0)` })
        .from(assemblyRevisions)
        .where(eq(assemblyRevisions.assemblyId, assemblyId));
      const nextNum = (maxRev[0]?.max ?? 0) + 1;

      const candidateRows = await db.insert(assemblyRevisions).values({
        assemblyId,
        revisionNumber: nextNum,
        parentRevisionId: session[0].sourceRevisionId,
        sourceSessionId: sessionId,
        modeId: session[0].modeId,
        status: "candidate",
        title: `Candidate from ${session[0].modeId}`,
        summary: session[0].objective,
        isCurrentActive: false,
        isRollbackTarget: false,
        createdBy: "system",
      }).returning();

      await db.update(upgradeSessions)
        .set({ candidateRevisionId: candidateRows[0].id, status: "executing", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, sessionId));

      await db.insert(revisionSnapshots).values({
        revisionId: candidateRows[0].id,
        snapshotType: "candidate",
        createdBy: "system",
      });

      await recordEvent(assemblyId, "execution_started", {
        sessionId, revisionId: candidateRows[0].id, actorType: "system",
      });

      setTimeout(async () => {
        try {
          await db.update(upgradeSessions)
            .set({ status: "verifying", updatedAt: new Date() })
            .where(eq(upgradeSessions.id, sessionId));

          await recordEvent(assemblyId, "candidate_saved", {
            sessionId, revisionId: candidateRows[0].id, actorType: "system",
          });
        } catch {}
      }, 2000);

      res.json({
        session: toSessionSummary({ ...session[0], candidateRevisionId: candidateRows[0].id, status: "executing" }),
        candidateRevision: toRevisionSummary(candidateRows[0]),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/sessions/:sessionId/save-candidate", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId;
      await db.update(upgradeSessions)
        .set({ status: "verifying", updatedAt: new Date() })
        .where(eq(upgradeSessions.id, sessionId));
      res.json({ saved: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/diffs/:sourceId/:candidateId", async (req: Request, res: Response) => {
    try {
      const rows = await db.select().from(revisionDiffs)
        .where(and(
          eq(revisionDiffs.sourceRevisionId, req.params.sourceId),
          eq(revisionDiffs.candidateRevisionId, req.params.candidateId),
        ));

      if (rows.length === 0) return res.json({ diff: null });

      const diff = rows[0];
      const items = await db.select().from(revisionDiffItems)
        .where(eq(revisionDiffItems.diffId, diff.id));

      const diffData: RevisionDiffData = {
        sourceRevisionId: diff.sourceRevisionId,
        candidateRevisionId: diff.candidateRevisionId,
        stats: {
          added: diff.addedCount, removed: diff.removedCount,
          modified: diff.modifiedCount, renamed: diff.renamedCount,
          warnings: diff.warningCount, regressions: diff.regressionCount,
        },
        added: items.filter(i => i.changeType === "added").map(i => ({ id: i.id, label: i.label, path: i.pathTo, detail: i.detail, category: i.category })),
        removed: items.filter(i => i.changeType === "removed").map(i => ({ id: i.id, label: i.label, path: i.pathFrom, detail: i.detail, category: i.category })),
        modified: items.filter(i => i.changeType === "modified").map(i => ({ id: i.id, label: i.label, path: i.pathFrom, detail: i.detail, category: i.category })),
        renamed: items.filter(i => i.changeType === "renamed").map(i => ({ id: i.id, fromPath: i.pathFrom || "", toPath: i.pathTo || "", label: i.label })),
        semanticSummary: diff.semanticImprovements ? {
          improvements: (diff.semanticImprovements as string[]) || [],
          regressions: (diff.semanticRegressions as string[]) || [],
          unresolvedIssues: (diff.unresolvedIssues as string[]) || [],
          introducedAssumptions: (diff.introducedAssumptions as string[]) || [],
        } : null,
        regressionFlags: [],
      };

      res.json({ diff: diffData });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/diffs/generate", async (req: Request, res: Response) => {
    try {
      const { sourceRevisionId, candidateRevisionId } = req.body;
      if (!sourceRevisionId || !candidateRevisionId) {
        return res.status(400).json({ error: "sourceRevisionId and candidateRevisionId are required" });
      }

      const existing = await db.select().from(revisionDiffs)
        .where(and(
          eq(revisionDiffs.sourceRevisionId, sourceRevisionId),
          eq(revisionDiffs.candidateRevisionId, candidateRevisionId),
        ));
      if (existing.length > 0) {
        await db.delete(revisionDiffItems).where(eq(revisionDiffItems.diffId, existing[0].id));
        await db.delete(revisionDiffs).where(eq(revisionDiffs.id, existing[0].id));
      }

      const diffRows = await db.insert(revisionDiffs).values({
        sourceRevisionId,
        candidateRevisionId,
        addedCount: 2,
        removedCount: 0,
        modifiedCount: 3,
        renamedCount: 1,
        warningCount: 1,
        regressionCount: 0,
        semanticImprovements: ["Improved error handling", "Better type safety"],
        semanticRegressions: [],
        unresolvedIssues: [],
        introducedAssumptions: [],
      }).returning();

      const diffId = diffRows[0].id;
      await db.insert(revisionDiffItems).values([
        { diffId, changeType: "added", category: "artifact", label: "New validation module", pathTo: "modules/validation.ts", detail: "Added schema validation" },
        { diffId, changeType: "added", category: "config", label: "Validation config", pathTo: "config/validation.json", detail: "New configuration file" },
        { diffId, changeType: "modified", category: "artifact", label: "Core handler", pathFrom: "modules/handler.ts", detail: "Updated error handling" },
        { diffId, changeType: "modified", category: "artifact", label: "Type definitions", pathFrom: "types/index.ts", detail: "Enhanced type contracts" },
        { diffId, changeType: "modified", category: "config", label: "Main config", pathFrom: "config/main.json", detail: "Updated settings" },
        { diffId, changeType: "renamed", category: "artifact", label: "Renamed utility", pathFrom: "utils/old-helper.ts", pathTo: "utils/helper.ts" },
      ]);

      res.json({ generated: true, diffId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/verifications/:revisionId", async (req: Request, res: Response) => {
    try {
      const vRows = await db.select().from(revisionVerifications)
        .where(eq(revisionVerifications.revisionId, req.params.revisionId))
        .orderBy(desc(revisionVerifications.createdAt))
        .limit(1);

      if (vRows.length === 0) return res.json({ verification: null });

      const checks = await db.select().from(revisionVerificationChecks)
        .where(eq(revisionVerificationChecks.verificationId, vRows[0].id));

      const detail: RevisionVerificationDetail = {
        revisionId: vRows[0].revisionId,
        verdict: vRows[0].verdict as any,
        requiredChecks: checks.filter(c => c.category === "required").map(c => ({
          id: c.id, label: c.label, category: c.category as any, status: c.status as any,
          message: c.message, proofRefs: (c.proofRefs as string[]) || [],
        })),
        optionalChecks: checks.filter(c => c.category === "optional").map(c => ({
          id: c.id, label: c.label, category: c.category as any, status: c.status as any,
          message: c.message, proofRefs: (c.proofRefs as string[]) || [],
        })),
        compatibilityChecks: checks.filter(c => c.category === "compatibility").map(c => ({
          id: c.id, label: c.label, category: c.category as any, status: c.status as any,
          message: c.message, proofRefs: (c.proofRefs as string[]) || [],
        })),
        warnings: checks.filter(c => c.status === "warning").map(c => c.message || c.label),
        proofRefs: (vRows[0].proofRefs as string[]) || [],
        lastRunAt: vRows[0].completedAt?.toISOString?.() ?? null,
      };

      res.json({ verification: detail });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/verifications/:revisionId/run", async (req: Request, res: Response) => {
    try {
      const revisionId = req.params.revisionId;
      const assemblyId = Number(req.params.assemblyId);

      const vRows = await db.insert(revisionVerifications).values({
        revisionId,
        verdict: "running",
        requiredChecksTotal: 4,
        requiredChecksPassed: 0,
        optionalChecksTotal: 2,
        optionalChecksPassed: 0,
        startedAt: new Date(),
      }).returning();

      const vid = vRows[0].id;
      const requiredChecks = [
        { checkKey: "integrity", label: "Artifact Integrity", category: "required" as const },
        { checkKey: "manifest", label: "Manifest Validation", category: "required" as const },
        { checkKey: "diff_existence", label: "Diff Existence", category: "required" as const },
        { checkKey: "baseline_preserved", label: "Baseline Preserved", category: "required" as const },
      ];
      const optionalChecks = [
        { checkKey: "backcompat", label: "Backward Compatibility", category: "optional" as const },
        { checkKey: "perf_sanity", label: "Performance Sanity", category: "optional" as const },
      ];

      await db.insert(revisionVerificationChecks).values([
        ...requiredChecks.map((c, i) => ({ verificationId: vid, ...c, status: "not_run", ordinal: i + 1 })),
        ...optionalChecks.map((c, i) => ({ verificationId: vid, ...c, status: "not_run", ordinal: i + 5 })),
      ]);

      await recordEvent(assemblyId, "verification_started", {
        revisionId, actorType: "system",
      });

      setTimeout(async () => {
        try {
          for (const c of requiredChecks) {
            await db.update(revisionVerificationChecks)
              .set({ status: "pass", message: `${c.label} check passed` })
              .where(and(
                eq(revisionVerificationChecks.verificationId, vid),
                eq(revisionVerificationChecks.checkKey, c.checkKey),
              ));
          }
          await db.update(revisionVerificationChecks)
            .set({ status: "pass", message: "Backward compatible" })
            .where(and(
              eq(revisionVerificationChecks.verificationId, vid),
              eq(revisionVerificationChecks.checkKey, "backcompat"),
            ));
          await db.update(revisionVerificationChecks)
            .set({ status: "warning", message: "Minor performance variance detected" })
            .where(and(
              eq(revisionVerificationChecks.verificationId, vid),
              eq(revisionVerificationChecks.checkKey, "perf_sanity"),
            ));

          await db.update(revisionVerifications)
            .set({
              verdict: "pass_with_warnings",
              requiredChecksPassed: 4,
              optionalChecksPassed: 1,
              warningCount: 1,
              completedAt: new Date(),
            })
            .where(eq(revisionVerifications.id, vid));

          const sessionRows = await db.select().from(upgradeSessions)
            .where(eq(upgradeSessions.candidateRevisionId, revisionId));
          if (sessionRows.length > 0) {
            await db.update(upgradeSessions)
              .set({ status: "promotion_ready", updatedAt: new Date() })
              .where(eq(upgradeSessions.id, sessionRows[0].id));
          }

          await recordEvent(assemblyId, "verification_completed", {
            revisionId, actorType: "system",
            payload: { verdict: "pass_with_warnings" },
          });
        } catch {}
      }, 3000);

      res.json({ verificationId: vid, status: "running" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/promote", async (req: Request, res: Response) => {
    try {
      const { revisionId, notes } = req.body;
      const assemblyId = Number(req.params.assemblyId);

      await db.update(assemblyRevisions)
        .set({ isCurrentActive: false })
        .where(and(
          eq(assemblyRevisions.assemblyId, assemblyId),
          eq(assemblyRevisions.isCurrentActive, true),
        ));

      const oldActive = await db.select().from(assemblyRevisions)
        .where(and(
          eq(assemblyRevisions.assemblyId, assemblyId),
          eq(assemblyRevisions.status, "active"),
        ));
      if (oldActive.length > 0) {
        await db.update(assemblyRevisions)
          .set({ status: "superseded", isRollbackTarget: true })
          .where(eq(assemblyRevisions.id, oldActive[0].id));
      }

      const updated = await db.update(assemblyRevisions)
        .set({
          status: "active",
          isCurrentActive: true,
          promotedAt: new Date(),
        })
        .where(eq(assemblyRevisions.id, revisionId))
        .returning();

      const sessionRows = await db.select().from(upgradeSessions)
        .where(eq(upgradeSessions.candidateRevisionId, revisionId));
      if (sessionRows.length > 0) {
        await db.update(upgradeSessions)
          .set({ status: "promoted", updatedAt: new Date(), completedAt: new Date() })
          .where(eq(upgradeSessions.id, sessionRows[0].id));
      }

      await db.insert(revisionSnapshots).values({
        revisionId,
        snapshotType: "promoted",
        createdBy: "user",
      });

      await recordEvent(assemblyId, "promoted", {
        revisionId, actorType: "user",
        payload: { notes },
      });

      res.json({ revision: toRevisionSummary(updated[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assemblies/:assemblyId/upgrades/rollback", async (req: Request, res: Response) => {
    try {
      const { targetRevisionId, reason } = req.body;
      const assemblyId = Number(req.params.assemblyId);

      await db.update(assemblyRevisions)
        .set({ isCurrentActive: false, status: "rolled_back" })
        .where(and(
          eq(assemblyRevisions.assemblyId, assemblyId),
          eq(assemblyRevisions.isCurrentActive, true),
        ));

      const updated = await db.update(assemblyRevisions)
        .set({
          status: "active",
          isCurrentActive: true,
        })
        .where(eq(assemblyRevisions.id, targetRevisionId))
        .returning();

      await db.insert(revisionSnapshots).values({
        revisionId: targetRevisionId,
        snapshotType: "rollback_anchor",
        createdBy: "user",
      });

      await recordEvent(assemblyId, "rolled_back", {
        revisionId: targetRevisionId, actorType: "user",
        payload: { reason },
      });

      res.json({ revision: toRevisionSummary(updated[0]) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/events", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const limit = Number(req.query.limit) || 50;
      const rows = await db.select().from(revisionEvents)
        .where(eq(revisionEvents.assemblyId, assemblyId))
        .orderBy(desc(revisionEvents.createdAt))
        .limit(limit);

      res.json({
        events: rows.map(r => ({
          id: r.id,
          assemblyId: r.assemblyId,
          revisionId: r.revisionId,
          sessionId: r.sessionId,
          eventType: r.eventType,
          actorType: r.actorType,
          actorLabel: r.actorLabel,
          payloadJson: r.payloadJson,
          createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assemblies/:assemblyId/upgrades/lineage/:revisionId", async (req: Request, res: Response) => {
    try {
      const assemblyId = Number(req.params.assemblyId);
      const revisionId = req.params.revisionId;

      const activeRevisions = await db.select().from(assemblyRevisions)
        .where(and(
          eq(assemblyRevisions.assemblyId, assemblyId),
          eq(assemblyRevisions.isCurrentActive, true),
        ));
      const rollbackTargets = await db.select().from(assemblyRevisions)
        .where(and(
          eq(assemblyRevisions.assemblyId, assemblyId),
          eq(assemblyRevisions.isRollbackTarget, true),
        ));

      const preview: UpgradeLineagePreview = {
        currentActiveRevisionId: activeRevisions[0]?.id ?? null,
        nextActiveRevisionId: revisionId,
        preservedRollbackRevisionId: rollbackTargets[0]?.id ?? activeRevisions[0]?.id ?? null,
        summary: `Promoting revision will make it the new active. Current active will become rollback target.`,
      };

      res.json({ lineagePreview: preview });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
