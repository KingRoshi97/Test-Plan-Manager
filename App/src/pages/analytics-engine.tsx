import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { BarChart3, Activity, Shield, Cpu, Wrench, FileCheck, Gauge, Zap, Database, CheckCircle } from "lucide-react";
import { AnalyticsCardRenderer } from "../components/analytics/AnalyticsCardRenderer";
import { AnalyticsGrid } from "../components/analytics/AnalyticsGrid";
import { AnalyticsToolbar } from "../components/analytics/AnalyticsToolbar";
import { AnalyticsLoadingState } from "../components/analytics/AnalyticsLoadingState";
import { AnalyticsErrorState } from "../components/analytics/AnalyticsErrorState";
import type { AnalyticsCardResponse } from "../../../shared/analytics/card-registry";

const HERO_CARDS = [
  "runs_active_live_card",
  "runs_success_rate_24h_card",
  "gates_failures_24h_card",
  "system_health_live_card",
];

const DOMAIN_SECTIONS = [
  {
    id: "run_lifecycle",
    title: "Run Lifecycle",
    icon: Activity,
    cards: [
      "runs_started_24h_card",
      "runs_completed_24h_card",
      "runs_failed_24h_card",
      "runs_duration_avg_24h_card",
    ],
  },
  {
    id: "stage_execution",
    title: "Stage Execution",
    icon: Cpu,
    cards: [
      "stages_failures_24h_card",
      "stages_duration_avg_24h_card",
    ],
  },
  {
    id: "operations",
    title: "Operations",
    icon: Wrench,
    cards: [
      "artifacts_generated_24h_card",
      "maintenance_executions_24h_card",
      "verification_pass_rate_24h_card",
      "cost_tokens_24h_card",
    ],
  },
];

type EngineHealth = {
  status: string;
  metrics_registered: number;
  cards_registered: number;
  events_total: number;
  snapshots_total: number;
};

export default function AnalyticsEnginePage() {
  const [, navigate] = useLocation();
  const [window, setWindow] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroCards, setHeroCards] = useState<AnalyticsCardResponse[]>([]);
  const [domainCards, setDomainCards] = useState<Record<string, AnalyticsCardResponse[]>>({});
  const [health, setHealth] = useState<EngineHealth | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allCardIds = [
        ...HERO_CARDS.map((id) => ({ card_id: id, window: id.includes("live") ? "live" : window })),
        ...DOMAIN_SECTIONS.flatMap((s) =>
          s.cards.map((id) => ({ card_id: id, window: id.includes("live") ? "live" : window }))
        ),
      ];

      const [cardsRes, healthRes] = await Promise.all([
        fetch("/api/analytics/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cards: allCardIds }),
        }),
        fetch("/api/analytics/health"),
      ]);

      if (!cardsRes.ok) throw new Error(`Cards API returned ${cardsRes.status}`);

      const cardsData = await cardsRes.json();
      const healthData = await healthRes.json();

      if (cardsData.ok && Array.isArray(cardsData.data)) {
        const allCards = cardsData.data as AnalyticsCardResponse[];
        const cardMap = new Map(allCards.map((c) => [c.card_id, c]));

        setHeroCards(HERO_CARDS.map((id) => cardMap.get(id)).filter(Boolean) as AnalyticsCardResponse[]);

        const domains: Record<string, AnalyticsCardResponse[]> = {};
        for (const section of DOMAIN_SECTIONS) {
          domains[section.id] = section.cards
            .map((id) => cardMap.get(id))
            .filter(Boolean) as AnalyticsCardResponse[];
        }
        setDomainCards(domains);
      }

      if (healthData.ok) {
        setHealth(healthData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [window]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleCardClick = (card: AnalyticsCardResponse) => {
    if (card.drilldown_target) {
      navigate(card.drilldown_target);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="glass-panel p-6 glow-border-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-processing)/0.15)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[hsl(var(--status-processing))]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Analytics Engine</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                AAE v1.0 — Single source of truth for all platform metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {health && (
              <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[hsl(var(--status-success))]" />
                  {health.status}
                </span>
                <span>{health.metrics_registered} metrics</span>
                <span>{health.cards_registered} cards</span>
                <span>{health.events_total} events</span>
              </div>
            )}
            <AnalyticsToolbar
              window={window}
              onWindowChange={setWindow}
              onRefresh={fetchCards}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {error && <AnalyticsErrorState message={error} />}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-4 h-4 text-[hsl(var(--status-processing))]" />
          <h2 className="text-sm font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">Platform Overview</h2>
        </div>
        {loading && heroCards.length === 0 ? (
          <AnalyticsLoadingState count={4} />
        ) : (
          <AnalyticsGrid columns={4}>
            {heroCards.map((card) => (
              <AnalyticsCardRenderer
                key={card.card_id}
                card={card}
                onClick={card.drilldown_target ? () => handleCardClick(card) : undefined}
              />
            ))}
          </AnalyticsGrid>
        )}
      </div>

      {DOMAIN_SECTIONS.map((section) => {
        const cards = domainCards[section.id] || [];
        const SectionIcon = section.icon;

        return (
          <div key={section.id}>
            <div className="flex items-center gap-2 mb-3">
              <SectionIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-sm font-medium text-[hsl(var(--foreground))] uppercase tracking-wider">{section.title}</h2>
            </div>
            {loading && cards.length === 0 ? (
              <AnalyticsLoadingState count={section.cards.length} />
            ) : (
              <AnalyticsGrid columns={section.cards.length <= 2 ? 2 : 4}>
                {cards.map((card) => (
                  <AnalyticsCardRenderer
                    key={card.card_id}
                    card={card}
                    onClick={card.drilldown_target ? () => handleCardClick(card) : undefined}
                  />
                ))}
              </AnalyticsGrid>
            )}
          </div>
        );
      })}

      {health && (
        <div className="glass-panel-solid p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Engine Stats</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-[hsl(var(--muted-foreground))]">Registered Metrics</div>
              <div className="text-lg font-semibold tabular-nums text-[hsl(var(--foreground))]">{health.metrics_registered}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--muted-foreground))]">Registered Cards</div>
              <div className="text-lg font-semibold tabular-nums text-[hsl(var(--foreground))]">{health.cards_registered}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--muted-foreground))]">Total Events</div>
              <div className="text-lg font-semibold tabular-nums text-[hsl(var(--foreground))]">{health.events_total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--muted-foreground))]">Active Snapshots</div>
              <div className="text-lg font-semibold tabular-nums text-[hsl(var(--foreground))]">{health.snapshots_total}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
