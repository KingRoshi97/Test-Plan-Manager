import type { AnalyticsCardResponse } from "../../../../shared/analytics/card-registry";
import { AnalyticsStatCard } from "./AnalyticsStatCard";
import { AnalyticsStatusCard } from "./AnalyticsStatusCard";

interface AnalyticsCardRendererProps {
  card: AnalyticsCardResponse;
  onClick?: () => void;
}

export function AnalyticsCardRenderer({ card, onClick }: AnalyticsCardRendererProps) {
  if (card.visualization === "status_indicator" || card.unit === "score") {
    return <AnalyticsStatusCard card={card} onClick={onClick} />;
  }

  return <AnalyticsStatCard card={card} onClick={onClick} />;
}
