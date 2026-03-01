export interface WorkBreakdownItem {
  task_id: string;
  name: string;
  description: string;
  depends_on: string[];
  acceptance_criteria_ids: string[];
  status: "pending" | "in_progress" | "done" | "blocked";
}

export interface WorkBreakdown {
  run_id: string;
  created_at: string;
  tasks: WorkBreakdownItem[];
}

export interface AcceptanceMapEntry {
  criteria_id: string;
  description: string;
  linked_task_ids: string[];
  linked_gate_ids: string[];
  status: "unverified" | "verified" | "failed";
}

export interface AcceptanceMap {
  run_id: string;
  created_at: string;
  entries: AcceptanceMapEntry[];
}

export interface SequencingStep {
  order: number;
  task_id: string;
  stage: string;
  dependencies_met: boolean;
}

export interface SequencingReport {
  run_id: string;
  created_at: string;
  steps: SequencingStep[];
}
