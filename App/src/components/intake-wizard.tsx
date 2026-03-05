import { useState, useCallback, useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "../lib/queryClient";
import { ArrowLeft, ArrowRight, Loader2, Check, SkipForward, Sparkles } from "lucide-react";
import { createEmptyIntakeData, type IntakeData } from "./intake/types";
import PageRouting from "./intake/page-routing";
import PageProject from "./intake/page-project";
import PageIntent from "./intake/page-intent";
import PageDesign from "./intake/page-design";
import PageFunctional from "./intake/page-functional";
import PageData from "./intake/page-data";
import PageAuth from "./intake/page-auth";
import PageIntegrations from "./intake/page-integrations";
import PageNfr from "./intake/page-nfr";
import PageCategory from "./intake/page-category";
import PageFinal from "./intake/page-final";

interface PageDef {
  id: number;
  label: string;
  isVisible: (data: IntakeData) => boolean;
}

const ALL_PAGES: PageDef[] = [
  { id: 0, label: "Routing", isVisible: () => true },
  { id: 1, label: "Project", isVisible: () => true },
  { id: 2, label: "Intent", isVisible: () => true },
  { id: 3, label: "Design", isVisible: () => true },
  { id: 4, label: "Functional", isVisible: () => true },
  { id: 5, label: "Data", isVisible: (d) => d.data.manages_data },
  { id: 6, label: "Auth", isVisible: (d) => d.auth.requires_auth },
  { id: 7, label: "Integrations", isVisible: (d) => d.integrations.has_integrations },
  { id: 8, label: "NFRs", isVisible: () => true },
  { id: 9, label: "Category", isVisible: (d) => !!d.routing.category },
  { id: 10, label: "Submit", isVisible: () => true },
];

const PRESET_MAP: Record<string, string> = {
  web_app: "WEB_APP_BASIC",
  internal_tool: "WEB_APP_BASIC",
  api_only: "API_SERVICE_BASIC",
  mobile_app: "WEB_APP_BASIC",
  library: "API_SERVICE_BASIC",
};

function validatePage(pageId: number, data: IntakeData): string | null {
  switch (pageId) {
    case 0: {
      const r = data.routing;
      if (!r.skill_level) return "Please select a skill level.";
      if (!r.category) return "Please select a project category.";
      if (!r.type_preset) return "Please select a type preset.";
      if (!r.build_target) return "Please select a build target.";
      if (!r.audience_context) return "Please select a target audience.";
      return null;
    }
    case 1: {
      if (!data.project.project_name.trim()) return "Project name is required.";
      if (!data.project.problem_statement.trim()) return "Problem statement is required.";
      return null;
    }
    case 10: {
      const f = data.final;
      if (!f.confirmed_priorities || !f.confirmed_binding || !f.confirmed_ready) {
        return "All three confirmations are required.";
      }
      return null;
    }
    default:
      return null;
  }
}

const PAGE_ID_TO_SECTION: Record<number, string> = {
  2: "intent",
  3: "design",
  4: "functional",
  5: "data",
  6: "auth",
  8: "nfr",
  9: "category_specific",
};

export default function IntakeWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<IntakeData>(createEmptyIntakeData);
  const [error, setError] = useState<string | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [autofilledSections, setAutofilledSections] = useState<Set<string>>(new Set());
  const autofillTriggered = useRef(false);

  const visiblePages = useMemo(() => {
    const always = ALL_PAGES.filter((p) => p.id <= 4 || p.id >= 8);
    const conditional = ALL_PAGES.filter((p) => p.id >= 5 && p.id <= 7 && p.isVisible(data));
    return [...always.filter((p) => p.id <= 4), ...conditional, ...always.filter((p) => p.id >= 8)];
  }, [data.data.manages_data, data.auth.requires_auth, data.integrations.has_integrations, data.routing.category]);

  const currentPageDef = visiblePages[currentStep];
  const totalSteps = visiblePages.length;
  const isLastStep = currentStep === totalSteps - 1;

  const onChange = useCallback((section: keyof IntakeData, updates: Record<string, unknown>) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
    setError(null);
  }, []);

  const runAutofillForSection = useCallback(async (sectionName: string) => {
    if (autofilledSections.has(sectionName)) return;
    setAutofillLoading(true);
    try {
      const resp = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routing: data.routing,
          project: data.project,
          targetSection: sectionName,
        }),
      });
      if (resp.ok) {
        const result = await resp.json();
        if (result.suggestions && Object.keys(result.suggestions).length > 0) {
          setData((prev) => ({
            ...prev,
            [sectionName]: { ...prev[sectionName as keyof IntakeData], ...result.suggestions },
          }));
          setAutofilledSections((prev) => new Set(prev).add(sectionName));
        }
      }
    } catch {
    } finally {
      setAutofillLoading(false);
    }
  }, [data.routing, data.project, autofilledSections]);

  const goNext = () => {
    if (!currentPageDef) return;
    const err = validatePage(currentPageDef.id, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (data.routing.autofill && currentPageDef.id >= 1) {
        const nextPage = visiblePages[nextStep];
        if (nextPage) {
          const sectionName = PAGE_ID_TO_SECTION[nextPage.id];
          if (sectionName) {
            runAutofillForSection(sectionName);
          }
        }
      }
    }
  };

  const goBack = () => {
    setError(null);
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepIdx: number) => {
    if (stepIdx < currentStep) {
      setError(null);
      setCurrentStep(stepIdx);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const intakePayload = {
        routing: {
          skill_level: data.routing.skill_level,
          category: data.routing.category,
          type_preset: data.routing.type_preset,
          build_target: data.routing.build_target,
          audience_context: data.routing.audience_context,
        },
        project: {
          project_name: data.project.project_name,
          problem_statement: data.project.problem_statement,
          overview: data.project.overview || undefined,
          desired_scope: data.routing.build_target,
          links: data.project.links.filter(Boolean),
          existing_repo: data.project.existing_repo || undefined,
          existing_state: data.project.existing_state || undefined,
          must_not_change: data.project.must_not_change || undefined,
          known_issues: data.project.known_issues || undefined,
        },
        uploads: {
          links: data.project.links.filter(Boolean),
        },
        intent: {
          alternatives: data.intent.alternatives || undefined,
          primary_goals: data.intent.primary_goals.filter(Boolean),
          success_metrics: data.intent.success_metrics || undefined,
          out_of_scope: data.intent.out_of_scope || undefined,
          brand_values: data.intent.brand_values || undefined,
          brand_promise: data.intent.brand_promise || undefined,
          voice_tone: data.intent.voice_tone || undefined,
        },
        design: {
          style_adjectives: data.design.style_adjectives || undefined,
          visual_preset: data.design.visual_preset || undefined,
          avoid_list: data.design.avoid_list || undefined,
          brand_colors: data.design.brand_colors || undefined,
          brand_fonts: data.design.brand_fonts || undefined,
          ui_density: data.design.ui_density || undefined,
          navigation_pref: data.design.navigation_pref || undefined,
        },
        functional: {
          must_have_features: data.functional.must_have_features.filter(Boolean),
          nice_to_have_features: data.functional.nice_to_have_features.filter(Boolean),
          roles: data.functional.roles.filter((r) => r.name),
          core_workflows: data.functional.core_workflows || undefined,
          business_rules: data.functional.business_rules || undefined,
        },
        data_model: {
          enabled: data.data.manages_data,
          entities: data.data.manages_data ? data.data.entities.filter((e) => e.name) : [],
          sensitive_flags: data.data.manages_data ? data.data.sensitive_flags : [],
          retention: data.data.retention || undefined,
          ownership: data.data.ownership || undefined,
        },
        auth: {
          enabled: data.auth.requires_auth,
          methods: data.auth.requires_auth ? data.auth.methods : [],
          account_lifecycle: data.auth.account_lifecycle || undefined,
          two_factor: data.auth.two_factor,
          session_rules: data.auth.session_rules || undefined,
          authorization_model: data.auth.authorization_model || undefined,
        },
        integrations: {
          enabled: data.integrations.has_integrations,
          services: data.integrations.has_integrations ? data.integrations.services.filter((s) => s.name) : [],
        },
        nfr: {
          response_time: data.nfr.response_time || undefined,
          throughput: data.nfr.throughput || undefined,
          expected_users: data.nfr.expected_users || undefined,
          concurrent_sessions: data.nfr.concurrent_sessions || undefined,
          reliability: data.nfr.reliability || undefined,
          offline_support: data.nfr.offline_support,
          compliance: data.nfr.compliance,
        },
        category_specific: {
          category: data.routing.category,
          screens: data.category_specific.screens.filter(Boolean),
          navigation_summary: data.category_specific.navigation_summary || undefined,
          endpoints: data.category_specific.endpoints.filter(Boolean),
          webhooks: data.category_specific.webhooks || undefined,
          environments: data.category_specific.environments || undefined,
          runtime: data.category_specific.runtime || undefined,
          observability: data.category_specific.observability || undefined,
          target_languages: data.category_specific.target_languages || undefined,
          api_surface: data.category_specific.api_surface || undefined,
        },
        definition_of_done: data.final.definition_of_done || undefined,
        acceptance_criteria: data.final.acceptance_criteria || undefined,
      };

      const preset = PRESET_MAP[data.routing.type_preset] || "WEB_APP_BASIC";

      const assembly = await apiRequest("/api/assemblies", {
        method: "POST",
        body: JSON.stringify({
          projectName: data.project.project_name,
          idea: data.project.problem_statement,
          preset,
          intakePayload,
        }),
      });

      if (data.final.start_pipeline) {
        await apiRequest(`/api/assemblies/${assembly.id}/run`, { method: "POST" });
      }

      return assembly;
    },
    onSuccess: (assembly) => {
      setLocation(`/assembly/${assembly.id}`);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    const err = validatePage(10, data);
    if (err) {
      setError(err);
      return;
    }
    createMutation.mutate();
  };

  const renderPage = () => {
    if (!currentPageDef) return null;
    const props = { data, onChange };
    switch (currentPageDef.id) {
      case 0: return <PageRouting {...props} />;
      case 1: return <PageProject {...props} />;
      case 2: return <PageIntent {...props} />;
      case 3: return <PageDesign {...props} />;
      case 4: return <PageFunctional {...props} />;
      case 5: return <PageData {...props} />;
      case 6: return <PageAuth {...props} />;
      case 7: return <PageIntegrations {...props} />;
      case 8: return <PageNfr {...props} />;
      case 9: return <PageCategory {...props} />;
      case 10: return <PageFinal {...props} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/")}
          className="p-2 rounded-md hover:bg-[hsl(var(--accent))] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">New Assembly</h1>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {visiblePages.map((page, stepIdx) => {
          const isCurrent = stepIdx === currentStep;
          const isCompleted = stepIdx < currentStep;
          const isSkippedConditional = page.id >= 5 && page.id <= 7;

          return (
            <button
              key={page.id}
              onClick={() => goToStep(stepIdx)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                isCurrent
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : isCompleted
                    ? "text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] cursor-pointer"
                    : "text-[hsl(var(--muted-foreground))] cursor-default"
              }`}
            >
              {isCompleted && <Check className="w-3 h-3" />}
              {isSkippedConditional && !isCurrent && !isCompleted && <SkipForward className="w-3 h-3" />}
              <span>{page.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6">
        {autofillLoading && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]">
            <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--primary))]" />
            <span className="text-sm text-[hsl(var(--primary))]">AI is drafting suggestions...</span>
          </div>
        )}
        {currentPageDef && autofilledSections.has(PAGE_ID_TO_SECTION[currentPageDef.id] || "") && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-md bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]">
            <Sparkles className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="text-sm text-[hsl(var(--primary))]">AI-drafted — review and edit as needed</span>
          </div>
        )}
        {renderPage()}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {currentStep + 1} / {totalSteps}
        </span>

        {!isLastStep ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || !data.final.confirmed_priorities || !data.final.confirmed_binding || !data.final.confirmed_ready}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {createMutation.isPending ? "Submitting..." : "Submit Intake"}
          </button>
        )}
      </div>
    </div>
  );
}
