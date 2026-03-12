import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Loader2, AlertTriangle, List, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";

interface RecentEventsTableProps {
  limit?: number;
  refreshToken?: number;
}

type AnalyticsEventRow = {
  id: number;
  event_id: string;
  event_type: string;
  domain_id: string;
  occurred_at: string;
  outcome: string | null;
  severity: string | null;
  run_id: string | null;
  stage_id: string | null;
  gate_id: string | null;
  environment: string;
  envelope: Record<string, unknown>;
};

type EventFilters = {
  event_type: string;
  domain_id: string;
  outcome: string;
};

export function RecentEventsTable({ limit = 25, refreshToken = 0 }: RecentEventsTableProps) {
  const [events, setEvents] = useState<AnalyticsEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<EventFilters>({ event_type: "", domain_id: "", outcome: "" });
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [domainIds, setDomainIds] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (filters.event_type) params.set("event_type", filters.event_type);
      if (filters.domain_id) params.set("domain_id", filters.domain_id);
      if (filters.outcome) params.set("outcome", filters.outcome);

      const res = await fetch(`/api/analytics/events?${params.toString()}`);
      const data = await res.json();

      if (!data.ok) {
        setError(data.error?.message || "Failed to load events");
        return;
      }

      setEvents(data.data.events || []);
      setTotal(data.data.total || 0);

      if (data.data.available_filters) {
        if (data.data.available_filters.event_types) setEventTypes(data.data.available_filters.event_types);
        if (data.data.available_filters.domain_ids) setDomainIds(data.data.available_filters.domain_ids);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, refreshToken]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.ceil(total / limit);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function getOutcomeColor(outcome: string | null): string {
    switch (outcome) {
      case "success": return "text-[hsl(var(--status-success))] bg-[hsl(var(--status-success)/0.1)]";
      case "failure": return "text-[hsl(var(--status-failure))] bg-[hsl(var(--status-failure)/0.1)]";
      case "partial": return "text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning)/0.1)]";
      case "skipped": return "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.3)]";
      default: return "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.3)]";
    }
  }

  function getSeverityColor(severity: string | null): string {
    switch (severity) {
      case "error":
      case "critical": return "text-[hsl(var(--status-failure))]";
      case "warn": return "text-[hsl(var(--status-warning))]";
      default: return "text-[hsl(var(--muted-foreground))]";
    }
  }

  return (
    <div className="glass-panel-solid p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Recent Events</span>
          <span className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] tabular-nums">{total.toLocaleString()} total</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select
          value={filters.event_type}
          onChange={(e) => handleFilterChange("event_type", e.target.value)}
          className="text-xs bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)] rounded px-2 py-1 text-[hsl(var(--foreground))]"
        >
          <option value="">All Event Types</option>
          {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filters.domain_id}
          onChange={(e) => handleFilterChange("domain_id", e.target.value)}
          className="text-xs bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)] rounded px-2 py-1 text-[hsl(var(--foreground))]"
        >
          <option value="">All Domains</option>
          {domainIds.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={filters.outcome}
          onChange={(e) => handleFilterChange("outcome", e.target.value)}
          className="text-xs bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)] rounded px-2 py-1 text-[hsl(var(--foreground))]"
        >
          <option value="">All Outcomes</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="partial">Partial</option>
          <option value="skipped">Skipped</option>
        </select>
      </div>

      {loading && events.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 py-4 justify-center">
          <AlertTriangle className="w-4 h-4 text-[hsl(var(--status-failure))]" />
          <span className="text-xs text-[hsl(var(--status-failure))]">{error}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-6 text-xs text-[hsl(var(--muted-foreground))]">No events found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border)/0.5)]">
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))] w-6"></th>
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">Event Type</th>
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">Domain</th>
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">Timestamp</th>
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">Outcome</th>
                  <th className="text-left pb-2 font-medium text-[hsl(var(--muted-foreground))]">IDs</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <>
                    <tr
                      key={event.id}
                      className="border-b border-[hsl(var(--border)/0.2)] hover:bg-[hsl(var(--accent)/0.3)] transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    >
                      <td className="py-2">
                        {expandedId === event.id ? (
                          <ChevronDown className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                        )}
                      </td>
                      <td className="py-2 text-[hsl(var(--foreground))] font-medium">{event.event_type}</td>
                      <td className="py-2 text-[hsl(var(--muted-foreground))]">{event.domain_id}</td>
                      <td className="py-2 text-[hsl(var(--muted-foreground))] tabular-nums">{formatDate(event.occurred_at)}</td>
                      <td className="py-2">
                        {event.outcome && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getOutcomeColor(event.outcome)}`}>
                            {event.outcome}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-[hsl(var(--muted-foreground))]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {event.run_id && <span className="text-[10px] bg-[hsl(var(--muted)/0.3)] rounded px-1">run:{event.run_id.slice(0, 8)}</span>}
                          {event.stage_id && <span className="text-[10px] bg-[hsl(var(--muted)/0.3)] rounded px-1">stage:{event.stage_id.slice(0, 8)}</span>}
                          {event.gate_id && <span className="text-[10px] bg-[hsl(var(--muted)/0.3)] rounded px-1">gate:{event.gate_id.slice(0, 8)}</span>}
                        </div>
                      </td>
                    </tr>
                    {expandedId === event.id && (
                      <tr key={`${event.id}-detail`} className="bg-[hsl(var(--muted)/0.1)]">
                        <td colSpan={6} className="p-3">
                          <div className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] mb-1 uppercase">Event Envelope</div>
                          <pre className="text-[10px] text-[hsl(var(--foreground))] bg-[hsl(var(--muted)/0.2)] rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
                            {JSON.stringify(event.envelope, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border)/0.3)]">
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-[hsl(var(--accent)/0.3)] disabled:opacity-30 transition-colors"
                >
                  <ChevronsLeft className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-[hsl(var(--accent)/0.3)] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-[hsl(var(--accent)/0.3)] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-[hsl(var(--accent)/0.3)] disabled:opacity-30 transition-colors"
                >
                  <ChevronsRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
