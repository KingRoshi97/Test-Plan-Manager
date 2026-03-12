import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { BarChart3, Activity, Shield, Cpu, Wrench, FileCheck, Gauge, Zap, Database, CheckCircle, ChevronDown, ChevronRight, Radio } from "lucide-react";
import { AnalyticsCardRenderer } from "../components/analytics/AnalyticsCardRenderer";
import { AnalyticsGrid } from "../components/analytics/AnalyticsGrid";
import { AnalyticsToolbar } from "../components/analytics/AnalyticsToolbar";
import { AnalyticsLoadingState } from "../components/analytics/AnalyticsLoadingState";
import { AnalyticsErrorState } from "../components/analytics/AnalyticsErrorState";
import { MetricTrendChart } from "../components/analytics/MetricTrendChart";
import { DimensionBreakdownTable } from "../components/analytics/DimensionBreakdownTable";
import { RecentEventsTable } from "../components/analytics/RecentEventsTable";
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
    primaryMetric: "runs.started.count.24h",
    primaryMetricTitle: "Runs Started",
    dimensionBreakdowns: [] as { metricKey: string; title: string; dimensionName: string; dimensionValues: string[] }[],
  },
  {
    id: "stage_execution",
    title: "Stage Execution",
    icon: Cpu,
    cards: [
      "stages_failures_24h_card",
      "stages_duration_avg_24h_card",
    ],
    primaryMetric: "stages.failures.count.24h",
    primaryMetricTitle: "Stage Failures",
    dimensionBreakdowns: [] as { metricKey: string; title: string; dimensionName: string; dimensionValues: string[] }[],
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
    primaryMetric: "artifacts.generated.count.24h",
    primaryMetricTitle: "Artifacts Generated",
    dimensionBreakdowns: [] as { metricKey: string; title: string; dimensionName: string; dimensionValues: string[] }[],
  },
];

type EngineHealth = {
  status: string;
  metrics_registered: number;
  cards_registered: number;
  events_total: number;
  snapshots_total: number;
};

const AUTO_REFRESH_INTERVAL = 30000;

function exportCardsAsCsv(heroCards: AnalyticsCardResponse[], domainCards: Record<string, AnalyticsCardResponse[]>) {
  const rows: string[][] = [["Card ID", "Title", "Value", "Unit", "Status", "State", "Updated At"]];

  const allCards = [...heroCards, ...Object.values(domainCards).flat()];
  for (const card of allCards) {
    rows.push([
      card.card_id,
      card.title,
      String(card.value ?? ""),
      card.unit ?? "",
      card.status ?? "",
      card.state,
      card.updated_at ?? "",
    ]);
  }

  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsEnginePage() {
  const [, navigate] = useLocation();
  const [timeWindow, setTimeWindow] = useState("24h");
  const [granularity, setGranularity] = useState("1h");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroCards, setHeroCards] = useState<AnalyticsCardResponse[]>([]);
  const [domainCards, setDomainCards] = useState<Record<string, AnalyticsCardResponse[]>>({});
  const [health, setHealth] = useState<EngineHealth | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(DOMAIN_SECTIONS.map((s) => s.id)));
  const [refreshCountdown, setRefreshCountdown] = useState(AUTO_REFRESH_INTERVAL / 1000);
  const [refreshToken, setRefreshToken] = useState(0);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerGlobalRefresh = useCallback(() => {
    setRefreshToken((t) => t + 1);
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allCardIds = [
        ...HERO_CARDS.map((id) => ({ card_id: id, window: id.includes("live") ? "live" : timeWindow })),
        ...DOMAIN_SECTIONS.flatMap((s) =>
          s.cards.map((id) => ({ card_id: id, window: id.includes("live") ? "live" : timeWindow }))
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
  }, [timeWindow]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    if (autoRefresh) {
      setRefreshCountdown(AUTO_REFRESH_INTERVAL / 1000);

      autoRefreshTimerRef.current = setInterval(() => {
        fetchCards();
        triggerGlobalRefresh();
        setRefreshCountdown(AUTO_REFRESH_INTERVAL / 1000);
      }, AUTO_REFRESH_INTERVAL);

      countdownRef.current = setInterval(() => {
        setRefreshCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, fetchCards]);

  const handleCardClick = (card: AnalyticsCardResponse) => {
    if (card.drilldown_target) {
      navigate(card.drilldown_target);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleExportCsv = () => {
    exportCardsAsCsv(heroCards, domainCards);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="glass-panel p-6 glow-border-cyan">
        <div className="flex items-center justify-between flex-wrap gap-4">
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

          <div className="flex items-center gap-4 flex-wrap">
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
            {autoRefresh && (
              <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--status-success))]">
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="tabular-nums">{refreshCountdown}s</span>
              </div>
            )}
            <AnalyticsToolbar
              window={timeWindow}
              onWindowChange={setTimeWindow}
              granularity={granularity}
              onGranularityChange={setGranularity}
              compareEnabled={compareEnabled}
              onCompareChange={setCompareEnabled}
              autoRefresh={autoRefresh}
              onAutoRefreshChange={setAutoRefresh}
              onRefresh={() => { fetchCards(); triggerGlobalRefresh(); }}
              onExportCsv={handleExportCsv}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {error && <AnalyticsErrorState message={error} onRetry={fetchCards} onBack={() => navigate("/")} />}

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
        const isExpanded = expandedSections.has(section.id);

        return (
          <div key={section.id} className="space-y-3">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center gap-2 group w-full text-left"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
              )}
              <SectionIcon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h2 className="text-sm font-medium text-[hsl(var(--foreground))] uppercase tracking-wider group-hover:text-[hsl(var(--primary))] transition-colors">{section.title}</h2>
              <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.5)]">{cards.length} cards</span>
            </button>

            {isExpanded && (
              <div className="space-y-4 pl-6">
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

                <MetricTrendChart
                  metricKey={section.primaryMetric}
                  title={section.primaryMetricTitle}
                  unit={cards[0]?.unit}
                  window={timeWindow}
                  granularity={granularity}
                  compareEnabled={compareEnabled}
                  refreshToken={refreshToken}
                />

                {section.dimensionBreakdowns.map((bd) => (
                  <DimensionBreakdownTable
                    key={`${bd.metricKey}-${bd.dimensionName}`}
                    metricKey={bd.metricKey}
                    title={bd.title}
                    dimensionName={bd.dimensionName}
                    dimensionValues={bd.dimensionValues}
                    window={timeWindow}
                    unit={cards[0]?.unit}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <RecentEventsTable refreshToken={refreshToken} />

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
