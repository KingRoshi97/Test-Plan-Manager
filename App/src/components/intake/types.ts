export interface IntakeData {
  routing: {
    skill_level: string;
    category: string;
    type_preset: string;
    build_target: string;
    audience_context: string;
    autofill: boolean;
  };
  project: {
    project_name: string;
    problem_statement: string;
    overview: string;
    links: string[];
    existing_repo: string;
    existing_state: string;
    must_not_change: string;
    known_issues: string;
    attachments: { id: string; filename: string; originalName: string; size: number; mimeType: string }[];
  };
  intent: {
    alternatives: string;
    primary_goals: string[];
    success_metrics: string;
    out_of_scope: string;
    brand_values: string;
    brand_promise: string;
    voice_tone: string;
  };
  design: {
    style_adjectives: string;
    visual_preset: string;
    avoid_list: string;
    brand_colors: string;
    brand_fonts: string;
    ui_density: string;
    navigation_pref: string;
  };
  functional: {
    must_have_features: string[];
    roles: { name: string; permissions: string }[];
    core_workflows: string;
    business_rules: string;
  };
  data: {
    manages_data: boolean;
    entities: { name: string; fields: string; relationships: string }[];
    sensitive_flags: string[];
    retention: string;
    ownership: string;
  };
  auth: {
    requires_auth: boolean;
    methods: string[];
    account_lifecycle: string;
    two_factor: boolean;
    session_rules: string;
    authorization_model: string;
  };
  integrations: {
    has_integrations: boolean;
    services: { name: string; purpose: string; direction: string; triggers: string; secrets: string }[];
  };
  nfr: {
    response_time: string;
    throughput: string;
    expected_users: string;
    concurrent_sessions: string;
    reliability: string;
    offline_support: boolean;
    compliance: string[];
  };
  category_specific: {
    screens: string[];
    navigation_summary: string;
    endpoints: string[];
    webhooks: string;
    environments: string;
    runtime: string;
    observability: string;
    target_languages: string;
    api_surface: string;
  };
  final: {
    definition_of_done: string;
    acceptance_criteria: string;
    confirmed_priorities: boolean;
    confirmed_binding: boolean;
    confirmed_ready: boolean;
    start_pipeline: boolean;
  };
}

export function createEmptyIntakeData(): IntakeData {
  return {
    routing: {
      skill_level: "",
      category: "",
      type_preset: "",
      build_target: "",
      audience_context: "",
      autofill: false,
    },
    project: {
      project_name: "",
      problem_statement: "",
      overview: "",
      links: [],
      existing_repo: "",
      existing_state: "",
      must_not_change: "",
      known_issues: "",
      attachments: [],
    },
    intent: {
      alternatives: "",
      primary_goals: [],
      success_metrics: "",
      out_of_scope: "",
      brand_values: "",
      brand_promise: "",
      voice_tone: "",
    },
    design: {
      style_adjectives: "",
      visual_preset: "",
      avoid_list: "",
      brand_colors: "",
      brand_fonts: "",
      ui_density: "",
      navigation_pref: "",
    },
    functional: {
      must_have_features: [],
      roles: [],
      core_workflows: "",
      business_rules: "",
    },
    data: {
      manages_data: false,
      entities: [],
      sensitive_flags: [],
      retention: "",
      ownership: "",
    },
    auth: {
      requires_auth: false,
      methods: [],
      account_lifecycle: "",
      two_factor: false,
      session_rules: "",
      authorization_model: "",
    },
    integrations: {
      has_integrations: false,
      services: [],
    },
    nfr: {
      response_time: "",
      throughput: "",
      expected_users: "",
      concurrent_sessions: "",
      reliability: "",
      offline_support: false,
      compliance: [],
    },
    category_specific: {
      screens: [],
      navigation_summary: "",
      endpoints: [],
      webhooks: "",
      environments: "",
      runtime: "",
      observability: "",
      target_languages: "",
      api_surface: "",
    },
    final: {
      definition_of_done: "",
      acceptance_criteria: "",
      confirmed_priorities: false,
      confirmed_binding: false,
      confirmed_ready: false,
      start_pipeline: false,
    },
  };
}

export interface PageProps {
  data: IntakeData;
  onChange: (section: keyof IntakeData, updates: Record<string, unknown>) => void;
}
