import { useMemo } from "react";
import type { Feature, CapabilityFilterState, CapabilityPageModel } from "../../types/capabilities";
import { buildCapabilityPageModel } from "../../lib/capabilities/buildCapabilityPageModel";

export function useCapabilitiesPageModel(
  features: Feature[],
  filters: CapabilityFilterState
): CapabilityPageModel {
  return useMemo(
    () => buildCapabilityPageModel(features, filters),
    [features, filters]
  );
}
