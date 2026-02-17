#!/usr/bin/env node
/**
 * axion:draft - Draft truth candidates
 * Reads from sources (RPBS/REBS) and produces initial domain logic candidates.
 * Uses AXION_PROJECT_IDEA and AXION_PROJECT_NAME from env for project context.
 * FAILS if required input files are missing.
 *
 * Usage:
 *   node axion/scripts/axion-draft.mjs --all
 *   node axion/scripts/axion-draft.mjs --module <name>
 *   node axion/scripts/axion-draft.mjs --all --json
 *   node axion/scripts/axion-draft.mjs --all --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  markStageFailed,
  failJson,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const { modules } = parseModuleArgs(process.argv);

const startTime = Date.now();

const receipt = {
  stage: 'draft',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function getDomainPrefix(config, moduleSlug) {
  const moduleDef = (config.modules || []).find(m => m.slug === moduleSlug);
  if (moduleDef && moduleDef.prefix) return moduleDef.prefix;
  return moduleSlug.substring(0, 2).toLowerCase();
}

function loadSourcesConfig() {
  const configPath = 'axion/config/sources.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/sources.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function ensureFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  if (fs.existsSync(filePath)) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    receipt.modifiedFiles.push(filePath);
    return true;
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  receipt.createdFiles.push(filePath);
  return true;
}

function parseSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let preamble = '';
  let currentSection = null;

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { name: line.replace(/^## /, '').trim(), header: line, body: '' };
    } else if (currentSection) {
      currentSection.body += line + '\n';
    } else {
      preamble += line + '\n';
    }
  }
  if (currentSection) {
    sections.push(currentSection);
  }
  return { preamble, sections };
}

function mergeIntoTemplate(existingContent, draftContent, sectionMap) {
  const template = parseSections(existingContent);
  const draft = parseSections(draftContent);

  const draftByName = {};
  for (const s of draft.sections) {
    draftByName[s.name] = s;
  }

  let result = template.preamble;

  for (const tSection of template.sections) {
    const draftSectionName = sectionMap[tSection.name];
    const draftSection = draftSectionName ? draftByName[draftSectionName] : null;

    if (draftSection) {
      result += `## ${tSection.name}\n${draftSection.body}`;
    } else {
      result += `## ${tSection.name}\n${tSection.body}`;
    }
  }

  return result.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

const BELS_SECTION_MAP = {
  'Policy Rules (Candidates)': 'Policy Rules (Candidates)',
  'Invariant Guarantees': 'Invariant Guarantees',
  'State Machines (Candidates)': 'State Machines (Candidates)',
  'Validation Rules (Candidates)': 'Validation Rules (Candidates)',
  'Side Effect Rules': 'Side Effect Rules',
  'Reason Codes Referenced': 'Reason Codes Referenced',
  'Computed / Derived Values': 'Computed / Derived Values',
  'Authorization Rules': 'Authorization Rules',
  'Rate Limits & Quotas': 'Rate Limits & Quotas',
  'Open Questions': 'Open Questions',
};

const DDES_SECTION_MAP = {
  'Purpose': 'Purpose',
  'Entities': 'Entities',
  'Key Responsibilities': 'Key Responsibilities',
  'Domain Boundaries': 'Domain Boundaries',
  'Entity Lifecycle Rules': 'Entity Lifecycle Rules',
  'Data Retention & Archival': 'Data Retention & Archival',
  'Dependencies': 'Dependencies',
  'Domain Events': 'Domain Events',
  'Open Questions': 'Open Questions',
};

const DIM_SECTION_MAP = {
  'Exposed Interfaces': 'Exposed Interfaces',
  'Consumed Interfaces': 'Consumed Interfaces',
  'Event Contracts': 'Event Contracts',
  'Standard Error Response Contract': 'Standard Error Response Contract',
  'API Versioning Strategy': 'API Versioning Strategy',
  'Data Flow Summary': 'Data Flow Summary',
  'Interface Dependencies Graph': 'Interface Dependencies Graph',
  'Open Questions': 'Open Questions',
};

function ensureFileWithMerge(filePath, draftContent, sectionMap) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (existing.includes('AXION:TEMPLATE_CONTRACT:v1')) {
      const merged = mergeIntoTemplate(existing, draftContent, sectionMap);
      if (!dryRun) {
        fs.writeFileSync(filePath, merged, 'utf8');
      }
      receipt.modifiedFiles.push(filePath + ' (merged)');
      return true;
    }
    if (!dryRun) {
      fs.writeFileSync(filePath, draftContent, 'utf8');
    }
    receipt.modifiedFiles.push(filePath);
    return true;
  }

  if (!dryRun) {
    fs.writeFileSync(filePath, draftContent, 'utf8');
  }
  receipt.createdFiles.push(filePath);
  return true;
}

function readSourceDoc(axionRoot, relPath) {
  const fullPath = path.join(axionRoot, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return '';
}

function extractEntitiesFromREBS(rebsContent) {
  const entities = [];
  const tableRegex = /\|\s*(\w[\w\s]*?)\s*\|.*?\|.*?\|.*?\|/g;
  let match;
  while ((match = tableRegex.exec(rebsContent)) !== null) {
    const name = match[1].trim();
    if (name && name !== 'Entity' && !name.includes('---')) {
      entities.push(name);
    }
  }
  return entities.length > 0 ? entities : ['Item', 'User'];
}

function extractRulesFromRPBS(rpbsContent) {
  const rules = [];
  const tableRegex = /\|\s*(R\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(rpbsContent)) !== null) {
    if (!match[1].includes('---')) {
      rules.push({ id: match[1].trim(), desc: match[2].trim(), domain: match[3].trim(), severity: match[4].trim() });
    }
  }
  return rules;
}

function parseUpgradeContext() {
  const revision = parseInt(process.env.AXION_REVISION || '1', 10);
  const upgradeNotes = process.env.AXION_UPGRADE_NOTES || '';
  const kitType = process.env.AXION_KIT_TYPE || 'original';
  return { revision, upgradeNotes, kitType, isUpgrade: kitType === 'upgrade' && !!upgradeNotes };
}

function parseProjectContext() {
  let idea = process.env.AXION_PROJECT_IDEA || '';
  if (process.env.AXION_PROJECT_IDEA_FILE) {
    try { idea = fs.readFileSync(process.env.AXION_PROJECT_IDEA_FILE, 'utf-8'); } catch {}
  }
  const name = process.env.AXION_PROJECT_NAME || 'Application';
  const upgrade = parseUpgradeContext();

  const entityPatterns = [
    /\b(user|account|profile|member|person|customer|client|admin|owner)s?\b/gi,
    /\b(note|document|file|page|article|post|entry|record|item|task|todo)s?\b/gi,
    /\b(categor(?:y|ies)|tag|label|folder|group|collection|list|board)s?\b/gi,
    /\b(comment|reply|message|notification|alert|email)s?\b/gi,
    /\b(order|payment|invoice|subscription|cart|product|price)s?\b/gi,
    /\b(team|organization|workspace|project|channel|room)s?\b/gi,
    /\b(session|token|permission|role|setting|preference)s?\b/gi,
    /\b(image|photo|video|media|attachment|upload)s?\b/gi,
  ];

  const entitiesSet = new Set();
  for (const pattern of entityPatterns) {
    const matches = idea.match(pattern);
    if (matches) {
      for (const m of matches) {
        let singular = m.replace(/ies$/i, 'y').replace(/s$/i, '');
        singular = singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
        entitiesSet.add(singular);
      }
    }
  }

  if (entitiesSet.size === 0) {
    const nameWords = name.replace(/[-_]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    for (const w of nameWords) {
      if (!['app', 'test', 'the', 'and', 'for', 'web', 'api'].includes(w.toLowerCase())) {
        entitiesSet.add(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      }
    }
    entitiesSet.add('User');
  }

  return { name, idea, entities: Array.from(entitiesSet), upgrade };
}

const MODULE_CONTENT = {
  architecture: {
    focus: 'system structure and component organization',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `ARCH_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} component must follow layered architecture pattern`,
      condition: `When ${e.toLowerCase()} operations are invoked`,
      action: `Route through service layer before data access`,
      ref: 'RPBS > Architecture > Layered Pattern',
    })),
    stateGen: (entities) => ({
      entity: entities[0] || 'Component',
      states: [
        { current: 'Uninitialized', event: 'INIT', next: 'Ready', deny: 'ARCH_NOT_READY' },
        { current: 'Ready', event: 'PROCESS', next: 'Active', deny: 'ARCH_UNAVAILABLE' },
        { current: 'Active', event: 'COMPLETE', next: 'Ready', deny: 'ARCH_BUSY' },
        { current: 'Active', event: 'ERROR', next: 'Degraded', deny: 'ARCH_ERROR' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_config`,
      rule: `Must conform to defined schema`,
      code: `ARCH_INVALID_${e.toUpperCase()}_CONFIG`,
    })),
  },
  systems: {
    focus: 'system components, services, and interactions',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `SYS_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} service must handle concurrent requests safely`,
      condition: `When multiple ${e.toLowerCase()} operations arrive simultaneously`,
      action: `Apply request queuing and isolation`,
      ref: 'RPBS > Systems > Concurrency',
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Service'}Service`,
      states: [
        { current: 'Stopped', event: 'START', next: 'Running', deny: 'SYS_START_FAILED' },
        { current: 'Running', event: 'HEALTH_CHECK', next: 'Running', deny: 'SYS_UNHEALTHY' },
        { current: 'Running', event: 'STOP', next: 'Stopped', deny: 'SYS_STOP_FAILED' },
        { current: 'Running', event: 'OVERLOAD', next: 'Degraded', deny: 'SYS_OVERLOADED' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_service_config`,
      rule: `Service endpoint must be valid URL`,
      code: `SYS_INVALID_${e.toUpperCase()}_ENDPOINT`,
    })),
  },
  contracts: {
    focus: 'API contracts, interfaces, and data schemas',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `API_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} API must validate request body against schema`,
      condition: `When ${e.toLowerCase()} create/update request is received`,
      action: `Validate against ${e} schema, reject with 400 if invalid`,
      ref: `RPBS > Contracts > ${e} Schema`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'API'}Request`,
      states: [
        { current: 'Received', event: 'VALIDATE', next: 'Validated', deny: 'API_VALIDATION_FAILED' },
        { current: 'Validated', event: 'PROCESS', next: 'Processing', deny: 'API_PROCESSING_ERROR' },
        { current: 'Processing', event: 'RESPOND', next: 'Completed', deny: 'API_RESPONSE_ERROR' },
        { current: 'Received', event: 'REJECT', next: 'Rejected', deny: 'API_REJECTED' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_id`,
      rule: `Must be valid identifier format`,
      code: `API_INVALID_${e.toUpperCase()}_ID`,
    })),
  },
  database: {
    focus: 'database schema, migrations, and data models',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `DB_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} table must have primary key and timestamps`,
      condition: `When ${e.toLowerCase()} table is created or migrated`,
      action: `Ensure id, createdAt, updatedAt columns exist`,
      ref: `RPBS > Database > ${e} Model`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Record'}Row`,
      states: [
        { current: 'Draft', event: 'SAVE', next: 'Persisted', deny: 'DB_SAVE_FAILED' },
        { current: 'Persisted', event: 'UPDATE', next: 'Persisted', deny: 'DB_UPDATE_FAILED' },
        { current: 'Persisted', event: 'DELETE', next: 'Deleted', deny: 'DB_DELETE_FAILED' },
        { current: 'Persisted', event: 'ARCHIVE', next: 'Archived', deny: 'DB_ARCHIVE_FAILED' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_data`,
      rule: `Must satisfy all NOT NULL constraints`,
      code: `DB_NULL_${e.toUpperCase()}_FIELD`,
    })),
  },
  data: {
    focus: 'data flows, transformations, and validation',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `DATA_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} data must be sanitized before storage`,
      condition: `When ${e.toLowerCase()} data enters the system`,
      action: `Apply sanitization and type coercion rules`,
      ref: `RPBS > Data > ${e} Validation`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Data'}Pipeline`,
      states: [
        { current: 'Raw', event: 'VALIDATE', next: 'Validated', deny: 'DATA_INVALID' },
        { current: 'Validated', event: 'TRANSFORM', next: 'Transformed', deny: 'DATA_TRANSFORM_ERROR' },
        { current: 'Transformed', event: 'PERSIST', next: 'Stored', deny: 'DATA_PERSIST_ERROR' },
        { current: 'Raw', event: 'REJECT', next: 'Rejected', deny: 'DATA_REJECTED' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_input`,
      rule: `Input must match expected data type and format`,
      code: `DATA_TYPE_${e.toUpperCase()}_MISMATCH`,
    })),
  },
  auth: {
    focus: 'authentication, authorization, and identity',
    policyGen: (_entities) => [
      { id: 'AUTH_001', desc: 'User must provide valid credentials to authenticate', condition: 'When login attempt is made', action: 'Verify credentials against stored hash', ref: 'RPBS > Auth > Login' },
      { id: 'AUTH_002', desc: 'Session tokens must expire after configured duration', condition: 'When session age exceeds limit', action: 'Invalidate session and require re-authentication', ref: 'RPBS > Auth > Sessions' },
      { id: 'AUTH_003', desc: 'Protected resources require valid authentication', condition: 'When unauthenticated request hits protected endpoint', action: 'Return 401 Unauthorized', ref: 'RPBS > Auth > Access Control' },
    ],
    stateGen: () => ({
      entity: 'UserSession',
      states: [
        { current: 'Anonymous', event: 'LOGIN', next: 'Authenticated', deny: 'AUTH_LOGIN_FAILED' },
        { current: 'Authenticated', event: 'REFRESH', next: 'Authenticated', deny: 'AUTH_REFRESH_FAILED' },
        { current: 'Authenticated', event: 'LOGOUT', next: 'Anonymous', deny: 'AUTH_LOGOUT_ERROR' },
        { current: 'Authenticated', event: 'EXPIRE', next: 'Expired', deny: 'AUTH_SESSION_EXPIRED' },
      ]
    }),
    validationGen: () => [
      { field: 'email', rule: 'Must be valid email format', code: 'AUTH_INVALID_EMAIL' },
      { field: 'password', rule: 'Must meet minimum complexity requirements', code: 'AUTH_WEAK_PASSWORD' },
      { field: 'token', rule: 'Must be valid JWT format', code: 'AUTH_INVALID_TOKEN' },
    ],
  },
  backend: {
    focus: 'server-side logic, APIs, and business rules',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `BE_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} operations must be wrapped in error handling`,
      condition: `When ${e.toLowerCase()} business logic executes`,
      action: `Catch errors, log context, return appropriate error response`,
      ref: `RPBS > Backend > ${e} Logic`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Request'}Handler`,
      states: [
        { current: 'Received', event: 'AUTHORIZE', next: 'Authorized', deny: 'BE_UNAUTHORIZED' },
        { current: 'Authorized', event: 'EXECUTE', next: 'Executing', deny: 'BE_EXECUTION_ERROR' },
        { current: 'Executing', event: 'COMPLETE', next: 'Completed', deny: 'BE_COMPLETION_ERROR' },
        { current: 'Executing', event: 'FAIL', next: 'Failed', deny: 'BE_OPERATION_FAILED' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_payload`,
      rule: `Request payload must contain all required fields`,
      code: `BE_MISSING_${e.toUpperCase()}_FIELDS`,
    })),
  },
  state: {
    focus: 'application state management and data flow',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `STATE_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} state changes must be dispatched through actions`,
      condition: `When ${e.toLowerCase()} data needs to be updated`,
      action: `Dispatch action with payload, update store immutably`,
      ref: `RPBS > State > ${e} Store`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'App'}State`,
      states: [
        { current: 'Idle', event: 'FETCH', next: 'Loading', deny: 'STATE_FETCH_ERROR' },
        { current: 'Loading', event: 'SUCCESS', next: 'Loaded', deny: 'STATE_LOAD_ERROR' },
        { current: 'Loading', event: 'FAILURE', next: 'Error', deny: 'STATE_LOAD_FAILED' },
        { current: 'Loaded', event: 'INVALIDATE', next: 'Stale', deny: 'STATE_INVALIDATION_ERROR' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_state`,
      rule: `State shape must conform to defined interface`,
      code: `STATE_SHAPE_${e.toUpperCase()}_INVALID`,
    })),
  },
  frontend: {
    focus: 'client-side UI, components, and user interactions',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `UI_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} form must validate inputs before submission`,
      condition: `When user submits ${e.toLowerCase()} form`,
      action: `Validate all required fields, show inline errors`,
      ref: `RPBS > Frontend > ${e} Form`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Page'}View`,
      states: [
        { current: 'Initial', event: 'LOAD', next: 'Loading', deny: 'UI_LOAD_ERROR' },
        { current: 'Loading', event: 'RENDER', next: 'Rendered', deny: 'UI_RENDER_ERROR' },
        { current: 'Rendered', event: 'INTERACT', next: 'Interactive', deny: 'UI_INTERACTION_ERROR' },
        { current: 'Interactive', event: 'SUBMIT', next: 'Submitting', deny: 'UI_SUBMIT_ERROR' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_title`,
      rule: `Title must be between 1 and 200 characters`,
      code: `UI_INVALID_${e.toUpperCase()}_TITLE`,
    })),
  },
  mobile: {
    focus: 'mobile-specific patterns and responsive behavior',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `MOB_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} views must be responsive and touch-friendly`,
      condition: `When ${e.toLowerCase()} is displayed on mobile viewport`,
      action: `Apply mobile layout with appropriate touch targets`,
      ref: `RPBS > Mobile > ${e} Layout`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Mobile'}View`,
      states: [
        { current: 'Portrait', event: 'ROTATE', next: 'Landscape', deny: 'MOB_ROTATION_ERROR' },
        { current: 'Landscape', event: 'ROTATE', next: 'Portrait', deny: 'MOB_ROTATION_ERROR' },
        { current: 'Online', event: 'DISCONNECT', next: 'Offline', deny: 'MOB_OFFLINE_ERROR' },
        { current: 'Offline', event: 'RECONNECT', next: 'Online', deny: 'MOB_SYNC_ERROR' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_input`,
      rule: `Touch input must have minimum 44px target area`,
      code: `MOB_TOUCH_${e.toUpperCase()}_TOO_SMALL`,
    })),
  },
  desktop: {
    focus: 'desktop application patterns and native interactions',
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `DSK_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} views must support keyboard navigation`,
      condition: `When user navigates ${e.toLowerCase()} with keyboard`,
      action: `Ensure all interactive elements are keyboard accessible`,
      ref: `RPBS > Desktop > ${e} Accessibility`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || 'Desktop'}Window`,
      states: [
        { current: 'Minimized', event: 'RESTORE', next: 'Windowed', deny: 'DSK_RESTORE_ERROR' },
        { current: 'Windowed', event: 'MAXIMIZE', next: 'Maximized', deny: 'DSK_MAXIMIZE_ERROR' },
        { current: 'Maximized', event: 'RESTORE', next: 'Windowed', deny: 'DSK_RESTORE_ERROR' },
        { current: 'Windowed', event: 'MINIMIZE', next: 'Minimized', deny: 'DSK_MINIMIZE_ERROR' },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_window`,
      rule: `Window dimensions must be within screen bounds`,
      code: `DSK_BOUNDS_${e.toUpperCase()}_INVALID`,
    })),
  },
};

function getDefaultModuleContent(moduleName) {
  return {
    focus: `${moduleName} domain concerns`,
    policyGen: (entities) => entities.slice(0, 3).map((e, i) => ({
      id: `${moduleName.toUpperCase().substring(0, 4)}_${String(i + 1).padStart(3, '0')}`,
      desc: `${e} operations must follow ${moduleName} domain rules`,
      condition: `When ${e.toLowerCase()} interacts with ${moduleName} subsystem`,
      action: `Apply ${moduleName}-specific validation and processing`,
      ref: `RPBS > ${moduleName} > ${e} Rules`,
    })),
    stateGen: (entities) => ({
      entity: `${entities[0] || moduleName}Process`,
      states: [
        { current: 'Pending', event: 'START', next: 'Active', deny: `${moduleName.toUpperCase().substring(0, 4)}_START_ERROR` },
        { current: 'Active', event: 'COMPLETE', next: 'Done', deny: `${moduleName.toUpperCase().substring(0, 4)}_COMPLETE_ERROR` },
        { current: 'Active', event: 'FAIL', next: 'Failed', deny: `${moduleName.toUpperCase().substring(0, 4)}_OPERATION_FAILED` },
        { current: 'Failed', event: 'RETRY', next: 'Active', deny: `${moduleName.toUpperCase().substring(0, 4)}_RETRY_ERROR` },
      ]
    }),
    validationGen: (entities) => entities.slice(0, 3).map(e => ({
      field: `${e.toLowerCase()}_${moduleName}_config`,
      rule: `Configuration must be valid for ${moduleName} domain`,
      code: `${moduleName.toUpperCase().substring(0, 4)}_INVALID_${e.toUpperCase()}_CONFIG`,
    })),
  };
}

const MODULE_DDES_CONTENT = {
  architecture: {
    purpose: 'Defines the overall system structure, component organization, and layering strategy',
    responsibilities: ['Define system component boundaries and layering', 'Establish communication patterns between modules', 'Enforce architectural constraints and conventions'],
    inScope: ['System-wide structural patterns', 'Component organization and naming'],
    outOfScope: ['Individual module implementation details', 'UI rendering logic'],
  },
  systems: {
    purpose: 'Manages system-level services, health monitoring, and infrastructure coordination',
    responsibilities: ['Manage service lifecycle and health checks', 'Coordinate system startup and shutdown sequences', 'Monitor system resource utilization'],
    inScope: ['Service management and orchestration', 'System health and diagnostics'],
    outOfScope: ['Business logic implementation', 'User-facing features'],
  },
  contracts: {
    purpose: 'Defines API contracts, type schemas, and interface specifications for cross-module communication',
    responsibilities: ['Define request/response schemas for all API endpoints', 'Maintain Zod validation schemas', 'Enforce type consistency across modules'],
    inScope: ['API type definitions and validation schemas', 'Cross-module interface contracts'],
    outOfScope: ['Route handler implementation', 'Database schema management'],
  },
  database: {
    purpose: 'Manages database schema, migrations, and data persistence layer',
    responsibilities: ['Define and maintain database table schemas', 'Execute safe schema migrations', 'Enforce data integrity constraints'],
    inScope: ['Table definitions and relationships', 'Migration management', 'Query optimization'],
    outOfScope: ['Business logic processing', 'API route handling'],
  },
  data: {
    purpose: 'Handles data validation, transformation, and flow between system layers',
    responsibilities: ['Validate and sanitize incoming data', 'Transform data between internal representations', 'Enforce data type coercion rules'],
    inScope: ['Data validation pipelines', 'Type coercion and transformation'],
    outOfScope: ['Database schema management', 'API contract definitions'],
  },
  auth: {
    purpose: 'Manages user authentication, authorization, session management, and access control',
    responsibilities: ['Authenticate user credentials', 'Manage session tokens and expiration', 'Enforce role-based access control'],
    inScope: ['Login/logout flows', 'Token management', 'Permission checks'],
    outOfScope: ['User profile management beyond auth', 'Business data access'],
  },
  backend: {
    purpose: 'Implements server-side business logic, API route handlers, and request processing',
    responsibilities: ['Handle incoming API requests', 'Execute business logic operations', 'Coordinate data persistence through storage layer'],
    inScope: ['Route handler implementation', 'Business rule enforcement', 'Error handling'],
    outOfScope: ['Database schema definition', 'Client-side rendering'],
  },
  state: {
    purpose: 'Manages client-side application state, data caching, and state synchronization',
    responsibilities: ['Manage UI state through immutable store patterns', 'Cache server data for optimistic updates', 'Synchronize state across components'],
    inScope: ['Client-side store management', 'Query caching strategies'],
    outOfScope: ['Server-side data persistence', 'API implementation'],
  },
  frontend: {
    purpose: 'Implements client-side UI components, pages, and user interaction patterns',
    responsibilities: ['Render UI components and pages', 'Handle user input and form validation', 'Manage client-side routing'],
    inScope: ['Component implementation', 'Page layouts', 'Form handling'],
    outOfScope: ['Server-side logic', 'Database operations'],
  },
  mobile: {
    purpose: 'Defines mobile-specific layout patterns, touch interactions, and responsive behavior',
    responsibilities: ['Ensure responsive layouts for mobile viewports', 'Implement touch-friendly interaction patterns', 'Handle offline/online state transitions'],
    inScope: ['Mobile layout adaptations', 'Touch interaction targets'],
    outOfScope: ['Desktop-specific patterns', 'Server-side processing'],
  },
  desktop: {
    purpose: 'Defines desktop-specific interaction patterns, keyboard navigation, and window management',
    responsibilities: ['Support keyboard navigation and shortcuts', 'Manage window state and resizing', 'Implement desktop-optimized layouts'],
    inScope: ['Keyboard accessibility', 'Window management patterns'],
    outOfScope: ['Mobile-specific patterns', 'Server-side processing'],
  },
};

const MODULE_DIM_CONTENT = {
  architecture: { exposedType: 'Config', consumedFrom: 'contracts' },
  systems: { exposedType: 'Service', consumedFrom: 'architecture' },
  contracts: { exposedType: 'Schema', consumedFrom: 'database' },
  database: { exposedType: 'Query', consumedFrom: 'contracts' },
  data: { exposedType: 'Pipeline', consumedFrom: 'database' },
  auth: { exposedType: 'Session', consumedFrom: 'database' },
  backend: { exposedType: 'REST', consumedFrom: 'contracts' },
  state: { exposedType: 'Store', consumedFrom: 'backend' },
  frontend: { exposedType: 'Component', consumedFrom: 'state' },
  mobile: { exposedType: 'View', consumedFrom: 'frontend' },
  desktop: { exposedType: 'Window', consumedFrom: 'frontend' },
};

function generateDDES(module, ctx) {
  const modDdes = MODULE_DDES_CONTENT[module] || {
    purpose: `Manages ${module} domain concerns for ${ctx.name}`,
    responsibilities: [
      `Handle ${module}-specific operations`,
      `Validate ${module} domain data`,
      `Coordinate with dependent modules`,
    ],
    inScope: [`${module} domain logic`, `${module} data management`],
    outOfScope: ['Cross-domain concerns', 'Infrastructure management'],
  };

  const entityRows = ctx.entities.slice(0, 5).map(e => {
    const domainMap = {
      'User': { fields: 'id, email, name, role, createdAt', rels: 'owns many resources' },
      'Note': { fields: 'id, title, content, authorId, createdAt', rels: 'belongs_to User' },
      'Tag': { fields: 'id, name, slug, color', rels: 'many_to_many with content entities' },
      'Folder': { fields: 'id, name, parentId, ownerId', rels: 'belongs_to User, has_many children' },
      'Task': { fields: 'id, title, description, status, assigneeId', rels: 'belongs_to User' },
      'Category': { fields: 'id, name, slug, parentId', rels: 'has_many children' },
      'Comment': { fields: 'id, body, authorId, targetId, createdAt', rels: 'belongs_to User' },
      'Document': { fields: 'id, title, content, authorId, status', rels: 'belongs_to User' },
      'Post': { fields: 'id, title, body, authorId, status', rels: 'belongs_to User' },
      'Product': { fields: 'id, name, description, price, categoryId', rels: 'belongs_to Category' },
      'Order': { fields: 'id, userId, status, total, createdAt', rels: 'belongs_to User' },
      'Message': { fields: 'id, content, senderId, recipientId', rels: 'belongs_to User' },
      'Team': { fields: 'id, name, description, ownerId', rels: 'belongs_to User, has_many members' },
      'Project': { fields: 'id, name, description, teamId, status', rels: 'belongs_to Team' },
    };
    const info = domainMap[e] || { fields: `id, name, description, createdAt`, rels: 'standalone' };
    const owner = e.toLowerCase() === 'user' ? 'auth domain' : 'This domain';
    return `| ${e} | Core ${e.toLowerCase()} entity | ${owner} | ${info.fields} | ${info.rels} |`;
  }).join('\n');

  const responsibilities = modDdes.responsibilities.map(r => `- ${r}`).join('\n');

  return `# Domain Design & Entity Specification (DDES) — ${module}

<!-- AXION:CORE_DOC:DDES -->

## Overview
**Domain Slug:** ${module}
**Domain Prefix:** ${module}
**Domain Type:** business
**Project:** ${ctx.name}

---

## Purpose
${modDdes.purpose}

---

## Entities

| Entity | Description | Owner | Fields (key) | Relationships |
|--------|-------------|-------|-------------|---------------|
${entityRows}

---

## Key Responsibilities

${responsibilities}

---

## Domain Boundaries

- **In Scope:**
  - ${modDdes.inScope[0]}
  - ${modDdes.inScope[1] || `${module} configuration management`}
- **Out of Scope:**
  - ${modDdes.outOfScope[0]}
  - ${modDdes.outOfScope[1] || 'Concerns owned by other domains'}

---

## Dependencies

| Dependency | What Is Consumed | Why |
|-----------|-----------------|-----|
| contracts | Type definitions and validation schemas | Ensure data consistency |
| database | Persistence layer | Store and retrieve ${module} data |

---

## Open Questions
- Specific ${module} domain lifecycle events need further definition
- Cross-domain data ownership boundaries need stakeholder input
`;
}

function generateDIM(module, ctx, _rpbsRules, prefix) {
  const modDim = MODULE_DIM_CONTENT[module] || { exposedType: 'REST', consumedFrom: 'contracts' };
  if (!prefix) prefix = module.substring(0, 2).toLowerCase();

  const exposedRows = ctx.entities.slice(0, 3).map((e, i) => {
    const ifId = `${prefix}_IF_${String(i + 1).padStart(3, '0')}`;
    return `| ${ifId} | REST | GET | /api/${e.toLowerCase()}s | List all ${e.toLowerCase()} records | frontend | contracts/${module} |`;
  }).join('\n');

  const mutationRows = ctx.entities.slice(0, 2).map((e, i) => {
    const ifId = `${prefix}_IF_${String(i + 4).padStart(3, '0')}`;
    return `| ${ifId} | REST | POST | /api/${e.toLowerCase()}s | Create a new ${e.toLowerCase()} | frontend | contracts/${module} |`;
  }).join('\n');

  const consumedRows = [
    `| ${modDim.consumedFrom}_IF_001 | ${modDim.consumedFrom} | REST | Type definitions for ${module} operations | contracts/${modDim.consumedFrom} |`,
  ].join('\n');

  const eventRows = ctx.entities.slice(0, 2).map(e =>
    `| ${e.toUpperCase()}_CREATED | emit | { ${e.toLowerCase()}Id, createdBy } | New ${e.toLowerCase()} is created | state, frontend | at-least-once |`
  ).join('\n');

  return `# Domain Interface Map (DIM) — ${module}

<!-- AXION:CORE_DOC:DIM -->

## Overview
**Domain Slug:** ${module}
**Prefix:** ${prefix}
**Type:** business
**Project:** ${ctx.name}

---

## Exposed Interfaces

| Interface ID | Type | Method | Path/Name | Description | Consumer(s) | Contract Ref |
|-------------|------|--------|-----------|-------------|-------------|--------------|
${exposedRows}
${mutationRows}

---

## Consumed Interfaces

| Interface ID | Provider Module | Type | Description | Contract Ref |
|-------------|----------------|------|-------------|--------------|
${consumedRows}

---

## Event Contracts

| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
|-----------|-----------|---------------|---------|-------------|-----------|
${eventRows}

---

## Data Flow Summary

- **Inbound:** Client requests arrive via REST API endpoints defined above
- **Processing:** Validate against contracts, apply ${module} business rules, persist changes
- **Outbound:** Return processed data to consumers, emit domain events for state updates

---

## Open Questions
- Specific rate limiting policies for ${module} endpoints need definition
- Event delivery guarantees need infrastructure planning
`;
}

function generateBELSCandidates(module, ctx, rpbsRules) {
  const modContent = MODULE_CONTENT[module] || getDefaultModuleContent(module);

  const policies = modContent.policyGen(ctx.entities);
  const stateInfo = modContent.stateGen(ctx.entities);
  const validations = modContent.validationGen(ctx.entities);

  const policyRows = policies.map(p =>
    `| ${p.id} | ${p.desc} | ${p.condition} | ${p.action} | ${p.ref} |`
  ).join('\n');

  const stateRows = stateInfo.states.map(s =>
    `| ${s.current} | ${s.event} | ${s.next} | ${s.deny} | RPBS > ${module} |`
  ).join('\n');

  const validationRows = validations.map(v =>
    `| ${v.field} | ${v.rule} | ${v.code} | RPBS > ${module} |`
  ).join('\n');

  const reasonCodes = [];
  for (const s of stateInfo.states) {
    reasonCodes.push({ code: s.deny, message: `${s.event} denied: transition from ${s.current} not allowed`, severity: 'ERROR' });
  }
  for (const v of validations) {
    reasonCodes.push({ code: v.code, message: `Validation failed: ${v.rule.toLowerCase()}`, severity: 'WARN' });
  }

  const reasonRows = reasonCodes.map(r =>
    `| ${r.code} | ${r.message} | ${r.severity} |`
  ).join('\n');

  const upgradeSection = ctx.upgrade.isUpgrade ? `
## Upgrade Context (Rev ${ctx.upgrade.revision})
**Kit Type:** Upgrade
**Upgrade Notes:**
${ctx.upgrade.upgradeNotes}

---
` : '';

  return `# Business Entity Logic Specification (BELS) — ${module}

## Overview
**Domain Slug:** ${module}
**Focus:** ${modContent.focus}
**Status:** ${ctx.upgrade.isUpgrade ? `UPGRADE - Revision ${ctx.upgrade.revision}` : 'DRAFT - Truth Candidates'}
**Project:** ${ctx.name}
${upgradeSection}
## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
${policyRows}

## State Machines (Candidates)

### Entity: ${stateInfo.entity}
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
${stateRows}

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
${validationRows}

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
${reasonRows}

## Open Questions
- Specific ${module} domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
`;
}

function generateOpenQuestions(module, ctx) {
  const modContent = MODULE_CONTENT[module] || getDefaultModuleContent(module);

  const entityQuestions = ctx.entities.slice(0, 3).map((e, i) =>
    `| Q${String(i + 1).padStart(3, '0')} | ${e} lifecycle management in ${module} domain | OPEN | Needs stakeholder input |`
  );

  const domainQuestions = [
    `| Q${String(ctx.entities.length + 1).padStart(3, '0')} | ${module} performance requirements | OPEN | Needs benchmarking |`,
    `| Q${String(ctx.entities.length + 2).padStart(3, '0')} | ${module} error recovery strategy | OPEN | Needs architecture review |`,
    `| Q${String(ctx.entities.length + 3).padStart(3, '0')} | ${module} cross-domain interactions | OPEN | Needs integration planning |`,
  ];

  return `# Open Questions — ${module}

## Overview
**Domain Slug:** ${module}
**Focus:** ${modContent.focus}
**Generated:** ${new Date().toISOString()}
**Project:** ${ctx.name}

## Unresolved Questions

### From Draft Process
- ${module} specific performance thresholds need definition
- Error handling granularity needs stakeholder alignment
- Integration boundaries with dependent modules need clarification

### Entity-Specific
${ctx.entities.slice(0, 3).map(e => `- ${e} lifecycle and ownership boundaries in ${module} context`).join('\n')}

### Implementation
- Specific technical constraints for ${module} domain
- Performance budget allocation for ${module} operations
- Testing strategy for ${module} edge cases

## Resolution Tracking

| Question ID | Question | Status | Resolution |
|-------------|----------|--------|------------|
${entityQuestions.join('\n')}
${domainQuestions.join('\n')}
`;
}

const UX_FOUNDATIONS_SECTION_MAP = {
  'User Types': 'User Types',
  'Primary User Mental Model': 'Primary User Mental Model',
  'Primary User Intent Loop': 'Primary User Intent Loop',
  'Cognitive Load Strategy': 'Cognitive Load Strategy',
  'Feedback & Visibility Laws': 'Feedback & Visibility Laws',
  'Error & Failure Experience': 'Error & Failure Experience',
  'Trust & Safety Signals': 'Trust & Safety Signals',
  'Flow Stability Rules': 'Flow Stability Rules',
  'UX Non-Goals': 'UX Non-Goals',
  'User Journeys': 'User Journeys',
  'Information Architecture': 'Information Architecture',
  'Interaction Patterns': 'Interaction Patterns',
  'Responsive Strategy': 'Responsive Strategy',
  'Open Questions': 'Open Questions',
};

const UI_CONSTRAINTS_SECTION_MAP = {
  'Structural Grouping Rules': 'Structural Grouping Rules',
  'Navigation Constraints': 'Navigation Constraints',
  'Interaction Pattern Limits': 'Interaction Pattern Limits',
  'State Visibility Rules': 'State Visibility Rules',
  'Timing & Feedback Constraints': 'Timing & Feedback Constraints',
  'Visual Design Constraints': 'Visual Design Constraints',
  'Layout Constraints': 'Layout Constraints',
  'Component Constraints': 'Component Constraints',
  'UI Structural Non-Goals': 'UI Structural Non-Goals',
  'Platform-Agnostic Rule': 'Platform-Agnostic Rule',
  'Responsive Behavior': 'Responsive Behavior',
  'Animation & Motion Constraints': 'Animation & Motion Constraints',
  'Dark Mode Requirements': 'Dark Mode Requirements',
  'Performance Constraints': 'Performance Constraints',
  'Open Questions': 'Open Questions',
};

const SCREENMAP_SECTION_MAP = {
  'Screen Inventory': 'Screen Inventory',
  'Navigation Flows': 'Navigation Flows',
  'Screen-to-Component Mapping': 'Screen-to-Component Mapping',
  'State Requirements Per Screen': 'State Requirements Per Screen',
  'Loading & Error States Per Screen': 'Loading & Error States Per Screen',
  'Responsive Breakpoint Behavior': 'Responsive Breakpoint Behavior',
  'Deep Linking Requirements': 'Deep Linking Requirements',
  'Screen Wireframe Notes': 'Screen Wireframe Notes',
  'Open Questions': 'Open Questions',
};

const TESTPLAN_SECTION_MAP = {
  'Test Strategy': 'Test Strategy',
  'Acceptance Scenarios': 'Acceptance Scenarios',
  'Business Rule Tests': 'Business Rule Tests',
  'Edge Cases': 'Edge Cases',
  'Error Scenarios': 'Error Scenarios',
  'API Contract Tests': 'API Contract Tests',
  'Accessibility Tests': 'Accessibility Tests',
  'Security Tests': 'Security Tests',
  'Performance Criteria': 'Performance Criteria',
  'Test Data Requirements': 'Test Data Requirements',
  'Regression Test Strategy': 'Regression Test Strategy',
  'Coverage Goals': 'Coverage Goals',
  'Open Questions': 'Open Questions',
};

const COMPONENT_LIBRARY_SECTION_MAP = {
  'Component Inventory': 'Component Inventory',
  'Component Variants': 'Component Variants',
  'Component Composition': 'Component Composition',
  'Component Dependencies': 'Component Dependencies',
  'Component State': 'Component State',
  'Accessibility Requirements': 'Accessibility Requirements',
  'Component Theming': 'Component Theming',
  'Animation & Transition Specs': 'Animation & Transition Specs',
  'Component Sizing': 'Component Sizing',
  'Open Questions': 'Open Questions',
};

const COPY_GUIDE_SECTION_MAP = {
  'Tone & Voice': 'Tone & Voice',
  'Page Titles & Headings': 'Page Titles & Headings',
  'Labels & Headings': 'Labels & Headings',
  'Error Messages': 'Error Messages',
  'Success Messages': 'Success Messages',
  'Empty States': 'Empty States',
  'Confirmation Dialogs': 'Confirmation Dialogs',
  'Tooltips & Help Text': 'Tooltips & Help Text',
  'Placeholder Text': 'Placeholder Text',
  'Loading & Progress Messages': 'Loading & Progress Messages',
  'Notification Copy': 'Notification Copy',
  'Accessibility Copy': 'Accessibility Copy',
  'Localization Notes': 'Localization Notes',
  'Open Questions': 'Open Questions',
};

const ERC_SECTION_MAP = {
  'ERC State': 'ERC State',
  'Verification Status': 'Verification Status',
  'Bound Input Documents': 'Bound Input Documents',
  'Locked Primary Outcomes': 'Locked Primary Outcomes',
  'Locked Non-Goals and Exclusions': 'Locked Non-Goals and Exclusions',
  'Locked Domain Boundaries': 'Locked Domain Boundaries',
  'Locked Core Flows': 'Locked Core Flows',
  'Locked UX and UI Laws': 'Locked UX and UI Laws',
  'Permitted Implementation Freedoms': 'Permitted Implementation Freedoms',
  'Forbidden Changes During Execution': 'Forbidden Changes During Execution',
  'Escalation and Rollback Triggers': 'Escalation and Rollback Triggers',
  'Locked Data Sections': 'Locked Data Sections',
  'ERC Success Conditions': 'ERC Success Conditions',
  'Implementation Notes': 'Implementation Notes',
  'Computed Values (from BELS)': 'Computed Values (from BELS)',
  'Cross-Domain Dependencies': 'Cross-Domain Dependencies',
  'Lock Metadata': 'Lock Metadata',
  'Agent Ingestion Instructions': 'Agent Ingestion Instructions',
  'Open Questions': 'Open Questions',
};

const ALRP_SECTION_MAP = {
  'Purpose': 'Purpose',
  '1) Agent Identity & Role': '1) Agent Identity & Role',
  '2) Input Authority Hierarchy': '2) Input Authority Hierarchy',
  '3) Initial Ingestion Sequence': '3) Initial Ingestion Sequence',
  '4) Phase Behavior Rules': '4) Phase Behavior Rules',
  '5) Default Action Rule': '5) Default Action Rule',
  '6) Assumption Prohibition': '6) Assumption Prohibition',
  '7) Reasoning Protocol': '7) Reasoning Protocol',
  '8) Stopping Conditions': '8) Stopping Conditions',
  '9) Execution Rules': '9) Execution Rules',
  '10) Communication Protocol': '10) Communication Protocol',
  '11) Source Document References': '11) Source Document References',
  '12) Guardrails & Constraints': '12) Guardrails & Constraints',
  '13) Recovery Protocol': '13) Recovery Protocol',
  'Agent Ingestion Instructions': 'Agent Ingestion Instructions',
  'Open Questions': 'Open Questions',
};

const SROL_SECTION_MAP = {
  'Purpose': 'Purpose',
  'SROL State': 'SROL State',
  'Inputs and Source of Truth': 'Inputs and Source of Truth',
  'Current Snapshot': 'Current Snapshot',
  'Optimization Mode': 'Optimization Mode',
  'Non-Negotiables': 'Non-Negotiables',
  'Diagnostic Lenses': 'Diagnostic Lenses',
  'Refinement Plan': 'Refinement Plan',
  'Execution Rules': 'Execution Rules',
  'Loop Structure': 'Loop Structure',
  'Execute — Implement Changes': 'Execute — Implement Changes',
  'Verify — Confirm Improvements': 'Verify — Confirm Improvements',
  'Stop Conditions': 'Stop Conditions',
  'Loop State': 'Loop State',
  'Agent Ingestion Instructions': 'Agent Ingestion Instructions',
  'Open Questions': 'Open Questions',
};

const TIES_SECTION_MAP = {
  'Purpose': 'Purpose',
  'Discipline Summary': 'Discipline Summary',
  'Discipline 1: Code Architecture Principles': 'Discipline 1: Code Architecture Principles',
  'Discipline 2: Functional Core / Imperative Shell': 'Discipline 2: Functional Core / Imperative Shell',
  'Discipline 3: Data Flow Engineering': 'Discipline 3: Data Flow Engineering',
  'Discipline 4: State Architecture': 'Discipline 4: State Architecture',
  'Discipline 5: Component Architecture': 'Discipline 5: Component Architecture',
  'Discipline 6: API & Service Architecture': 'Discipline 6: API & Service Architecture',
  'Discipline 7: Contract-Driven Development': 'Discipline 7: Contract-Driven Development',
  'Discipline 8: Error, Failure & Recovery Patterns': 'Discipline 8: Error, Failure & Recovery Patterns',
  'Discipline 9: Idempotency, Determinism & Side Effects': 'Discipline 9: Idempotency, Determinism & Side Effects',
  'Discipline 10: Performance & Optimization Patterns': 'Discipline 10: Performance & Optimization Patterns',
  'Discipline 11: Debugging & Diagnosis Engineering': 'Discipline 11: Debugging & Diagnosis Engineering',
  'Discipline 12: Refactoring Mastery': 'Discipline 12: Refactoring Mastery',
  'Build Execution Plan': 'Build Execution Plan',
  'Open Questions': 'Open Questions',
};

const MODULE_UX_CONTENT = {
  frontend: {
    userTypes: (entities) => entities.slice(0, 3).map((e, i) => ({
      type: `${e} User`, actor: `ACTOR_${String(i + 1).padStart(3, '0')}`,
      desc: `User who interacts with ${e.toLowerCase()} features`, goals: `Create, view, and manage ${e.toLowerCase()}s`,
      frequency: 'Daily', savvy: 'Low-Medium',
    })),
    journeyGen: (entities) => entities.slice(0, 2).map(e => ({
      name: `Create ${e}`, userType: `${e} User`, trigger: `User wants to create a new ${e.toLowerCase()}`,
      entry: `/${e.toLowerCase()}s`, steps: [
        { name: 'Navigate', sees: `${e} list page`, does: 'Clicks "Create New" button', responds: `Shows ${e.toLowerCase()} creation form` },
        { name: 'Fill Form', sees: 'Empty form with required fields', does: 'Enters all required information', responds: 'Validates input in real-time' },
        { name: 'Submit', sees: 'Completed form', does: 'Clicks "Save" button', responds: `Creates ${e.toLowerCase()} and redirects to detail view` },
      ],
      success: `${e} successfully created and visible in list`, emotion: 'curious → focused → satisfied',
    })),
    interactionPatterns: { validation: 'On blur', errorDisplay: 'Inline', autoSave: 'No', pagination: 'Load more', nav: 'Sidebar', feedback: 'Toast' },
  },
  backend: {
    userTypes: (entities) => [{ type: 'API Consumer', actor: 'ACTOR_001', desc: 'Frontend client or external service calling APIs', goals: 'Execute CRUD operations via REST endpoints', frequency: 'Continuous', savvy: 'High' }],
    journeyGen: (entities) => entities.slice(0, 2).map(e => ({
      name: `${e} CRUD Flow`, userType: 'API Consumer', trigger: `Client needs to manage ${e.toLowerCase()} data`,
      entry: `/api/${e.toLowerCase()}s`, steps: [
        { name: 'Request', sees: 'API endpoint', does: `Sends HTTP request to /api/${e.toLowerCase()}s`, responds: 'Validates request and processes' },
        { name: 'Process', sees: 'Processing confirmation', does: 'Awaits response', responds: 'Returns JSON response with data or error' },
      ],
      success: 'API returns correct status code and response body', emotion: 'request → processing → response',
    })),
    interactionPatterns: { validation: 'On request', errorDisplay: 'JSON error response', autoSave: 'N/A', pagination: 'Cursor-based', nav: 'N/A', feedback: 'HTTP status codes' },
  },
  auth: {
    userTypes: () => [
      { type: 'Unauthenticated Visitor', actor: 'ACTOR_001', desc: 'Anonymous user without active session', goals: 'Register or log in', frequency: 'Occasional', savvy: 'Low-Medium' },
      { type: 'Authenticated User', actor: 'ACTOR_002', desc: 'User with active session and valid token', goals: 'Access protected resources', frequency: 'Daily', savvy: 'Low-Medium' },
    ],
    journeyGen: () => [
      { name: 'Login', userType: 'Unauthenticated Visitor', trigger: 'User wants to access protected content', entry: '/login', steps: [
        { name: 'Enter Credentials', sees: 'Login form', does: 'Enters email and password', responds: 'Validates format' },
        { name: 'Authenticate', sees: 'Loading state', does: 'Clicks "Log in"', responds: 'Validates credentials, creates session, redirects to dashboard' },
      ], success: 'User is logged in and redirected to their dashboard', emotion: 'intent → anxious → relieved' },
    ],
    interactionPatterns: { validation: 'On submit', errorDisplay: 'Inline + toast', autoSave: 'No', pagination: 'N/A', nav: 'Minimal (auth pages)', feedback: 'Toast + redirect' },
  },
};

function getDefaultUXContent(moduleName) {
  return {
    userTypes: (entities) => entities.slice(0, 2).map((e, i) => ({
      type: `${e} Operator`, actor: `ACTOR_${String(i + 1).padStart(3, '0')}`,
      desc: `User interacting with ${moduleName} ${e.toLowerCase()} features`, goals: `Manage ${e.toLowerCase()} within ${moduleName}`,
      frequency: 'Regular', savvy: 'Medium',
    })),
    journeyGen: (entities) => entities.slice(0, 1).map(e => ({
      name: `${moduleName} ${e} Workflow`, userType: `${e} Operator`, trigger: `User initiates ${e.toLowerCase()} operation in ${moduleName}`,
      entry: `/${moduleName}`, steps: [
        { name: 'Navigate', sees: `${moduleName} dashboard`, does: `Selects ${e.toLowerCase()} section`, responds: `Displays ${e.toLowerCase()} interface` },
        { name: 'Operate', sees: `${e} management view`, does: `Performs ${e.toLowerCase()} operations`, responds: 'Confirms action completion' },
      ],
      success: `${e} operation completed successfully`, emotion: 'intent → focused → satisfied',
    })),
    interactionPatterns: { validation: 'On blur', errorDisplay: 'Inline', autoSave: 'No', pagination: 'Page numbers', nav: 'Sidebar', feedback: 'Toast' },
  };
}

function generateUXFoundations(module, ctx) {
  const modUx = MODULE_UX_CONTENT[module] || getDefaultUXContent(module);
  const userTypes = modUx.userTypes(ctx.entities);
  const journeys = modUx.journeyGen(ctx.entities);
  const ip = modUx.interactionPatterns;

  const userTypeRows = userTypes.map(u =>
    `| ${u.type} | ${u.actor} | ${u.desc} | ${u.goals} | ${u.frequency} | ${u.savvy} |`
  ).join('\n');

  const journeySections = journeys.map(j => {
    const steps = j.steps.map((s, i) =>
      `  ${i + 1}. **${s.name}** — User sees: ${s.sees} → User does: ${s.does} → System responds: ${s.responds}`
    ).join('\n');
    return `### Journey: ${j.name}
- **User Type:** ${j.userType}
- **Trigger:** ${j.trigger}
- **Entry Point:** ${j.entry}
- **Steps:**
${steps}
- **Success State:** ${j.success}
- **Emotional Arc:** ${j.emotion}
`;
  }).join('\n');

  const primaryEntity = ctx.entities[0] || 'item';
  const primaryEntityLower = primaryEntity.toLowerCase();

  return `# UX Foundations — ${module}

## Overview
**Domain Slug:** ${module}
**Project:** ${ctx.name}

---

## User Types

| User Type | RPBS Actor | Description | Primary Goals | Usage Frequency | Tech Savviness |
|-----------|-----------|-------------|---------------|----------------|---------------|
${userTypeRows}

---

## Primary User Mental Model

- **The user believes the system is:** A tool for managing ${ctx.entities.slice(0, 3).map(e => e.toLowerCase() + 's').join(', ')}
- **The user expects actions to result in:** Immediate, visible changes to their ${primaryEntityLower} data
- **The user expects feedback to be:** Clear and immediate — success or failure explained in plain language
- **Real-world metaphor:** Like a well-organized workspace for ${primaryEntityLower} management

**Rule:** The system must never behave in ways that violate this mental model.

---

## Primary User Intent Loop

1. **User enters with intent:** Manage or view ${primaryEntityLower}s
2. **User performs action:** Creates, reads, updates, or deletes a ${primaryEntityLower}
3. **System responds:** Confirms action with visible feedback
4. **User understands outcome:** Sees updated state reflecting their action

**Rule:** This loop must remain intact across all features and changes.

---

## Cognitive Load Strategy

- One primary decision at a time — forms and flows focus the user on one task
- Progressive disclosure only — advanced options hidden until needed
- No simultaneous critical choices — destructive actions isolated from creation flows
- No hidden system state — user always knows what is happening and what they can do next

**Rule:** Complexity must be earned, not assumed.

---

## Feedback & Visibility Laws

- Every meaningful action produces visible feedback (toast, inline update, or redirect)
- State changes are observable immediately — no silent background updates
- Errors are explicit, not silent — every failure has a user-facing message
- Success is acknowledged clearly — user never wonders if their action worked

**Rule:** Users must never guess whether something worked.

---

## Error & Failure Experience

- Errors are recoverable where possible — user can retry or correct input
- Blame is never placed on the user — messages explain what went wrong, not what the user did wrong
- System explains what happened in plain language — no technical jargon in error messages
- Failure does not destroy progress — partial input is preserved when possible

**Rule:** Failure should not punish exploration.

---

## Trust & Safety Signals

- Predictable behavior — same actions produce same results every time
- No surprise actions — system never does something the user didn't ask for
- Clear consequences before irreversible actions — destructive actions show what will happen
- Explicit confirmation for destructive actions — delete, remove, and discard require confirmation

**Rule:** The system must never feel deceptive.

---

## Flow Stability Rules

- Core flows do not change meaning between visits — ${primaryEntityLower} CRUD always works the same way
- Similar actions behave similarly across ${module} — consistency across all entity types
- Navigation does not break mental continuity — back button and breadcrumbs preserve context

**Rule:** Users should feel oriented at all times.

---

## UX Non-Goals

- Not gamified — no points, badges, or achievements
- Not exploratory — the product has a clear purpose, not a discovery experience
- Not dense — information is presented at a comfortable reading density

**Rule:** Avoiding non-goals is as important as hitting goals.

---

## User Journeys

${journeySections}

---

## Information Architecture

### Content Hierarchy
- **Primary content:** ${ctx.entities.slice(0, 2).map(e => `${e} management`).join(', ')}
- **Secondary content:** Settings, preferences, metadata
- **Tertiary content:** Admin tools, system info

### Grouping Strategy
| Group | Contains | Rationale |
|-------|---------|-----------|
${ctx.entities.slice(0, 3).map(e => `| ${e} Management | ${e} CRUD, ${e} search, ${e} details | Groups all ${e.toLowerCase()}-related features |`).join('\n')}

---

## Interaction Patterns

### Form Patterns
- Validation timing: ${ip.validation}
- Error display: ${ip.errorDisplay}
- Auto-save: ${ip.autoSave}

### List/Collection Patterns
- Pagination: ${ip.pagination}
- Empty state behavior: Illustration + descriptive message + CTA
- Loading state behavior: Skeleton placeholders

### Navigation Patterns
- Primary navigation: ${ip.nav}
- Breadcrumbs: Yes for nested views
- Back button behavior: Return to parent list

### Feedback Patterns
- Success feedback: ${ip.feedback}
- Error feedback: ${ip.errorDisplay}
- Loading feedback: Skeleton / spinner
- Destructive action confirmation: Modal dialog

---

## Responsive Strategy

| Breakpoint | Target Devices | Layout Changes |
|-----------|---------------|----------------|
| Mobile (<640px) | Phones | Single column, bottom nav, stacked cards |
| Tablet (640-1024px) | Tablets | Two columns, collapsible sidebar |
| Desktop (>1024px) | Desktop | Full sidebar, multi-column grid |

---

## Open Questions
- Specific ${module} user journey steps need further detail from RPBS
- Accessibility requirements need review against RPBS §18
- Mental model metaphor needs validation against RPBS product identity
`;
}

const MODULE_UI_CONTENT = {
  frontend: {
    colorSystem: [
      { token: 'Primary', light: 'hsl(222, 47%, 51%)', dark: 'hsl(217, 91%, 60%)', usage: 'CTAs, links, active states' },
      { token: 'Background', light: 'hsl(0, 0%, 100%)', dark: 'hsl(222, 47%, 11%)', usage: 'Page backgrounds' },
      { token: 'Surface', light: 'hsl(210, 40%, 96%)', dark: 'hsl(217, 33%, 17%)', usage: 'Card/panel backgrounds' },
      { token: 'Foreground', light: 'hsl(222, 47%, 11%)', dark: 'hsl(210, 40%, 98%)', usage: 'Primary text' },
      { token: 'Destructive', light: 'hsl(0, 84%, 60%)', dark: 'hsl(0, 63%, 31%)', usage: 'Error states, delete actions' },
    ],
    iconLib: 'Lucide React', componentLib: 'Shadcn UI', darkMode: 'Required',
    containerStyle: 'B: Background color elevation',
  },
  backend: {
    colorSystem: [{ token: 'N/A', light: 'N/A', dark: 'N/A', usage: 'Backend has no UI — constraints apply to API response formatting' }],
    iconLib: 'N/A', componentLib: 'N/A', darkMode: 'N/A', containerStyle: 'N/A',
  },
};

function generateUIConstraints(module, ctx) {
  const modUi = MODULE_UI_CONTENT[module] || MODULE_UI_CONTENT.frontend;

  const colorRows = modUi.colorSystem.map(c =>
    `| ${c.token} | ${c.light} | ${c.dark} | ${c.usage} |`
  ).join('\n');

  const primaryEntity = ctx.entities[0] || 'item';
  const primaryEntityLower = primaryEntity.toLowerCase();

  return `# UI Constraints — ${module}

## Overview
**Domain Slug:** ${module}
**Project:** ${ctx.name}

---

## Structural Grouping Rules

- Actions related to the same ${primaryEntityLower} must be co-located on the same view
- Configuration and settings must not interrupt ${primaryEntityLower} management flows
- Review and execution contexts must be visually separable
- Primary actions are always visible, secondary actions are progressive

**Rule:** UI structure must reinforce user intent.

---

## Navigation Constraints

- Maximum navigation depth: 3 levels deep
- Modal vs full-context rules: Modals for confirmations and quick edits only, full pages for creation and detail views
- Always accessible elements: Main nav, user menu, back button
- Core flow interruption: Notifications must never interrupt a ${primaryEntityLower} creation or edit flow

**Rule:** Navigation must not fracture mental continuity.

---

## Interaction Pattern Limits

- One primary action per view — create, edit, or review, not all at once
- Secondary actions must not steal focus from primary
- Destructive actions require friction — confirmation step before delete/remove
- Drag-and-drop only as enhancement, never sole interaction method

**Rule:** Patterns must be consistent and limited.

---

## State Visibility Rules

- Current state of the active ${primaryEntityLower} is always visible
- Progress indicators shown for multi-step processes
- Pending actions are surfaced, not hidden
- Errors and warnings are always visible until explicitly dismissed

**Rule:** Critical state must never be hidden.

---

## Timing & Feedback Constraints

- Immediate visual acknowledgement of user input — < 100ms
- Loading states shown for any async action > 200ms
- Clear completion signals for all operations
- Optimistic updates where safe, with rollback on failure

**Rule:** Silence is not feedback.

---

## Visual Design Constraints

### Color System
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
${colorRows}

### Typography
| Element | Font Family | Size | Weight | Line Height |
|---------|-----------|------|--------|-------------|
| Heading 1 | System sans-serif | 2rem | 700 | 1.2 |
| Heading 2 | System sans-serif | 1.5rem | 600 | 1.3 |
| Heading 3 | System sans-serif | 1.25rem | 600 | 1.4 |
| Body | System sans-serif | 1rem | 400 | 1.5 |
| Small/Caption | System sans-serif | 0.875rem | 400 | 1.4 |
| Code/Mono | System monospace | 0.875rem | 400 | 1.5 |

### Iconography
- Icon library: ${modUi.iconLib}
- Icon size standard: 16px (sm), 20px (default), 24px (lg)
- Icon color rules: Inherit text color by default

---

## Layout Constraints

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.25rem (4px) | Tight spacing (icon padding, badge padding) |
| sm | 0.5rem (8px) | Compact spacing (between related items) |
| md | 1rem (16px) | Standard spacing (card padding, section gaps) |
| lg | 1.5rem (24px) | Generous spacing (section separation) |
| xl | 2rem (32px) | Maximum spacing (page-level margins) |

### Container Rules
- Container styling approach: ${modUi.containerStyle}
- Nesting depth limit: Max 2 levels
- Card inside card: Never allowed

---

## Component Constraints

### Allowed Component Library
- Primary library: ${modUi.componentLib}
- Icon library: ${modUi.iconLib}
- Custom components allowed: Only when library insufficient

### Component Usage Rules
| Component | Allowed | Constraints | Notes |
|-----------|---------|------------|-------|
| Button | Yes | Use library variants only | Never custom hover states |
| Card | Yes | Never nest cards inside cards | Use for content grouping |
| Badge | Yes | Always single-line | Sufficient width required |
| Modal/Dialog | Yes | Confirmation for destructive actions | Max 1 visible at a time |
| Toast | Yes | Auto-dismiss, max 3 visible | Success/error feedback |

---

## UI Structural Non-Goals

- Deep nested navigation beyond 3 levels
- Overloaded views with multiple competing primary actions
- Hidden critical actions that require discovery
- Gesture-only critical actions with no visible alternative

**Rule:** Forbidden structures must not be introduced.

---

## Platform-Agnostic Rule

- Web, mobile, and desktop must share mental structure for ${primaryEntityLower} management
- Platform-specific optimizations allowed for: Touch targets on mobile, keyboard shortcuts on desktop
- Platform must NOT redefine: Flow meaning, core interactions, state visibility

**Rule:** Platform must not redefine experience.

---

## Responsive Behavior

| Breakpoint | Sidebar | Navigation | Cards/Grid | Tables | Modals |
|-----------|---------|-----------|------------|--------|--------|
| Mobile | Hidden | Bottom nav / hamburger | 1 column | Horizontal scroll | Full screen |
| Tablet | Collapsible | Top bar | 2 columns | Responsive | Centered overlay |
| Desktop | Visible | Sidebar | 3+ columns | Full width | Centered overlay |

---

## Animation & Motion Constraints

- Transitions allowed: Minimal
- Duration standard: 150ms for micro-interactions, 300ms for page transitions
- Easing standard: ease-out
- prefers-reduced-motion handling: Required
- Layout-shifting animations: Never allowed on hover

---

## Dark Mode Requirements

- Dark mode support: ${modUi.darkMode}
- Implementation: CSS variables + Tailwind dark: prefix
- Default theme: System preference
- User toggle: Yes

---

## Performance Constraints

- Max bundle size target: < 200KB initial JS
- Lazy loading required for: Route-level code splitting, images below fold
- Image optimization: WebP with fallback, responsive srcset
- Font loading strategy: swap
- Initial render target: < 1.5s FCP

---

## Open Questions
- Exact brand color palette pending RPBS §30 definition
- ${module}-specific component constraints need further specification
`;
}

function generateScreenmap(module, ctx, prefix) {

  const screenRows = ctx.entities.slice(0, 4).map((e, i) => {
    const scrId = `${prefix}_SCR_${String(i + 1).padStart(3, '0')}`;
    const routes = [
      { route: `/${e.toLowerCase()}s`, purpose: `Browse and search all ${e.toLowerCase()} records`, auth: 'No' },
      { route: `/${e.toLowerCase()}s/:id`, purpose: `View ${e.toLowerCase()} detail`, auth: 'No' },
      { route: `/${e.toLowerCase()}s/new`, purpose: `Create new ${e.toLowerCase()}`, auth: 'Yes' },
      { route: `/${e.toLowerCase()}s/:id/edit`, purpose: `Edit existing ${e.toLowerCase()}`, auth: 'Yes' },
    ];
    const r = routes[i] || routes[0];
    return `| ${scrId} | ${e} ${i === 0 ? 'List' : i === 1 ? 'Detail' : i === 2 ? 'Create' : 'Edit'} | ${r.route} | ${r.purpose} | — (top-level) | ${r.auth} | FEAT_${String(i + 1).padStart(3, '0')} |`;
  }).join('\n');

  const navRows = ctx.entities.slice(0, 2).map((e, i) => {
    const navId = `${prefix}_NAV_${String(i + 1).padStart(3, '0')}`;
    return `| ${navId} | ${e} browse-to-detail | List → Detail | ${e} List | ${e} Detail | Click ${e.toLowerCase()} card |`;
  }).join('\n');

  const componentRows = ctx.entities.slice(0, 3).map((e, i) => {
    const scrId = `${prefix}_SCR_${String(i + 1).padStart(3, '0')}`;
    return `| ${scrId} | ${i === 0 ? 'List + Sidebar' : i === 1 ? 'Detail + Actions' : 'Form'} | ${e}Card, SearchBar, Pagination | Search, filter, click actions |`;
  }).join('\n');

  const stateRows = ctx.entities.slice(0, 3).map((e, i) => {
    const scrId = `${prefix}_SCR_${String(i + 1).padStart(3, '0')}`;
    return `| ${scrId} | ${e} list data | GET /api/${e.toLowerCase()}s | Skeleton | Cache 5min |`;
  }).join('\n');

  return `# Screen Map — ${module}

## Overview
**Domain Slug:** ${module}
**Prefix:** ${prefix}
**Project:** ${ctx.name}

---

## Screen Inventory

| Screen ID | Name | Route/Path | Purpose | Parent Screen | Auth Required? | RPBS Feature Ref |
|----------|------|-----------|---------|--------------|---------------|-----------------|
${screenRows}

---

## Navigation Flows

| Flow ID | Description | Steps | Entry Point | Exit Point | Trigger |
|---------|-------------|-------|------------|-----------|---------|
${navRows}

---

## Screen-to-Component Mapping

| Screen ID | Layout Type | Components Used | Key Interactive Elements |
|----------|------------|----------------|------------------------|
${componentRows}

---

## State Requirements Per Screen

| Screen ID | Required Data | Data Source | Loading Strategy | Cache Strategy |
|----------|---------------|-----------|-----------------|---------------|
${stateRows}

---

## Open Questions
- Screen wireframe details need visual design input
- Navigation flow edge cases need RPBS §5 journey mapping
`;
}

function generateTestplan(module, ctx, rpbsRules, prefix) {

  const acceptanceRows = ctx.entities.slice(0, 3).map((e, i) => {
    const testId = `${prefix}_TEST_${String(i + 1).padStart(3, '0')}`;
    return `| ${testId} | ${e} creation happy path | User on /${e.toLowerCase()}s/new | Fills all required fields and submits | ${e} created, redirected to detail page, success toast shown | P0 | RPBS §5 |`;
  }).join('\n');

  const bizRuleRows = ctx.entities.slice(0, 2).map((e, i) => {
    const testId = `${prefix}_TEST_${String(100 + i + 1).padStart(3, '0')}`;
    return `| ${testId} | ${prefix}_RULE_${String(i + 1).padStart(3, '0')} | unit | ${e} validation enforced | Invalid ${e.toLowerCase()} data submitted | Validation error returned with correct error code | P0 |`;
  }).join('\n');

  const edgeCaseRows = ctx.entities.slice(0, 2).map((e, i) => {
    const edgeId = `${prefix}_EDGE_${String(i + 1).padStart(3, '0')}`;
    return `| ${edgeId} | Empty ${e.toLowerCase()} list renders empty state correctly | Empty state illustration and CTA displayed | Medium |`;
  }).join('\n');

  const errorRows = ctx.entities.slice(0, 2).map((e, i) => {
    const errId = `${prefix}_ERR_${String(i + 1).padStart(3, '0')}`;
    return `| ${errId} | Invalid ${e.toLowerCase()} data submitted | VALIDATION_${e.toUpperCase()}_INVALID | Please check your ${e.toLowerCase()} details | Highlight invalid fields | BELS |`;
  }).join('\n');

  const apiRows = ctx.entities.slice(0, 2).map((e, i) => {
    const testId = `${prefix}_TEST_${String(200 + i + 1).padStart(3, '0')}`;
    return `| ${testId} | /api/${e.toLowerCase()}s | GET | ?page=1&limit=10 | 200 | { items: ${e}[], total: number } | P0 |`;
  }).join('\n');

  return `# Test Plan — ${module}

## Overview
**Domain Slug:** ${module}
**Prefix:** ${prefix}
**Project:** ${ctx.name}

---

## Test Strategy

### Testing Priorities
- **P0 (Critical):** Core ${module} CRUD operations, authentication gates, data validation
- **P1 (Important):** Edge cases, error handling, cross-module interactions
- **P2 (Nice-to-have):** Performance benchmarks, accessibility audits, visual regression

### Test Types in Scope
| Type | In Scope? | Tool/Framework | Coverage Target |
|------|----------|---------------|----------------|
| Unit | Yes | Vitest | 80% of business logic |
| Integration | Yes | Vitest + supertest | Key API flows |
| E2E | Yes | Playwright | Critical user journeys |
| Contract | Yes | Vitest | All DIM interfaces |
| Performance | Yes | Lighthouse / custom | P1 targets |
| Accessibility | Yes | axe-core | WCAG 2.1 AA |

---

## Acceptance Scenarios

| Scenario ID | Description | Given | When | Then | Priority | Source |
|------------|-------------|-------|------|------|----------|--------|
${acceptanceRows}

---

## Business Rule Tests

| Test ID | Rule Ref | Type | Description | Input/Setup | Expected Result | Priority |
|---------|---------|------|-------------|-------------|----------------|----------|
${bizRuleRows}

---

## Edge Cases

| Edge Case ID | Description | Expected Behavior | Risk Level |
|-------------|-------------|-------------------|-----------|
${edgeCaseRows}

---

## Error Scenarios

| Error ID | Trigger | Expected Error Code | User-Facing Message | Recovery | Source |
|---------|---------|-------------------|-------------------|----------|--------|
${errorRows}

---

## API Contract Tests

| Test ID | Endpoint | Method | Input | Expected Status | Expected Body Shape | Priority |
|---------|---------|--------|-------|----------------|--------------------|---------| 
${apiRows}

---

## Performance Criteria

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| API response time (p95) | < 200ms | Load test with k6 | P1 |
| Page load (FCP) | < 1.5s | Lighthouse CI | P1 |
| Bundle size (initial) | < 200KB | Bundler analysis | P2 |

---

## Test Data Requirements

| Fixture | Description | Fields | Notes |
|---------|-------------|--------|-------|
${ctx.entities.slice(0, 3).map(e => `| test${e} | Sample ${e.toLowerCase()} for testing | id, name, status, createdAt | Auto-generated per test run |`).join('\n')}

### Test Environment
- Database: Test database (isolated from production)
- External services: Mocked where possible
- Auth: Test tokens with configurable roles

---

## Coverage Goals

| Area | Target Coverage | Notes |
|------|----------------|-------|
| Unit tests | 80% | Business logic and validators |
| Integration tests | 70% | API routes and data flows |
| E2E tests | Critical paths | All P0 user journeys |

---

## Open Questions
- Exact performance targets need RPBS §7 non-functional profile
- Test data seeding strategy needs finalization
`;
}

function generateComponentLibrary(module, ctx, prefix) {

  const componentRows = ctx.entities.slice(0, 4).map((e, i) => {
    const cmpId = `${prefix}_CMP_${String(i + 1).padStart(3, '0')}`;
    const categories = ['Data Display', 'Input/Form', 'Data Display', 'Layout'];
    const descs = [
      `Displays a ${e.toLowerCase()} summary in list/grid views`,
      `Form for creating/editing ${e.toLowerCase()} records`,
      `Detailed view of a single ${e.toLowerCase()}`,
      `Container layout for ${e.toLowerCase()} sections`,
    ];
    return `| ${cmpId} | ${e}Card | ${categories[i] || 'Data Display'} | ${descs[i] || `${e} display component`} | Yes | ${e.toLowerCase()}: ${e}, onClick: () => void |`;
  }).join('\n');

  const variantRows = ctx.entities.slice(0, 2).map((e, i) => {
    const cmpId = `${prefix}_CMP_${String(i + 1).padStart(3, '0')}`;
    return `| ${cmpId} | default | Standard list/grid display | Full card with image, title, meta |\n| ${cmpId} | compact | Search results, sidebar | Title + meta inline, no image |`;
  }).join('\n');

  const compositionRows = ctx.entities.slice(0, 2).map(e =>
    `| ${e}Card | Avatar, Badge, ActionButton | Horizontal header + vertical body |`
  ).join('\n');

  const depRows = ctx.entities.slice(0, 3).map((e, i) => {
    const cmpId = `${prefix}_CMP_${String(i + 1).padStart(3, '0')}`;
    return `| ${cmpId} | Button, Badge, Avatar | Shadcn UI, Lucide React |`;
  }).join('\n');

  const stateRows = ctx.entities.slice(0, 2).map((e, i) => {
    const cmpId = `${prefix}_CMP_${String(i + 1).padStart(3, '0')}`;
    return `| ${cmpId} | ${i === 0 ? 'expanded: boolean' : 'formValues: FormData'} | ${i === 0 ? 'Uncontrolled' : 'Controlled'} | ${i === 0 ? 'false' : 'empty'} |`;
  }).join('\n');

  const sizingRows = ctx.entities.slice(0, 2).map(e =>
    `| ${e}Card | 200px | 400px | Auto | Stack vertically on mobile |`
  ).join('\n');

  return `# Component Library — ${module}

## Overview
**Domain Slug:** ${module}
**Prefix:** ${prefix}
**Project:** ${ctx.name}

---

## Component Inventory

| Component ID | Name | Category | Description | Reusable? | Props/Inputs |
|-------------|------|----------|-------------|----------|-------------|
${componentRows}

---

## Component Variants

| Component ID | Variant | When to Use | Visual Difference |
|-------------|---------|-------------|-------------------|
${variantRows}

---

## Component Composition

| Parent Component | Child Components | Composition Pattern |
|-----------------|-----------------|-------------------|
${compositionRows}

---

## Component Dependencies

| Component ID | Depends On | External Libraries |
|-------------|-----------|-------------------|
${depRows}

---

## Component State

| Component ID | Internal State | Controlled/Uncontrolled | Default |
|-------------|---------------|------------------------|---------|
${stateRows}

---

## Component Sizing

| Component | Min Width | Max Width | Height | Responsive Behavior |
|-----------|----------|----------|--------|-------------------|
${sizingRows}

---

## Open Questions
- Component prop types need refinement from DDES entity field definitions
- Accessibility requirements per component pending UX_Foundations review
`;
}

function generateCopyGuide(module, ctx, prefix) {

  const titleRows = ctx.entities.slice(0, 3).map(e =>
    `| ${prefix}_SCR_${e.toLowerCase()} | ${e}s — ${ctx.name} | ${e}s | Browse and manage your ${e.toLowerCase()}s |`
  ).join('\n');

  const labelRows = ctx.entities.slice(0, 3).map((e, i) => {
    const lblId = `${prefix}_LBL_${String(i + 1).padStart(3, '0')}`;
    return `| ${lblId} | Nav item | ${e}s | Primary navigation |`;
  }).join('\n');

  const errorMsgRows = ctx.entities.slice(0, 3).map(e => [
    `| ${e.toUpperCase()}_NOT_FOUND | We couldn't find that ${e.toLowerCase()}. It may have been removed. | Browse other ${e.toLowerCase()}s | error |`,
    `| ${e.toUpperCase()}_VALIDATION_FAILED | Please check your ${e.toLowerCase()} details and try again. | Review highlighted fields | validation |`,
  ]).flat().join('\n');

  const successRows = ctx.entities.slice(0, 3).map(e =>
    `| ${e} created | ${e} created successfully! | Toast | 3s auto-dismiss |`
  ).join('\n');

  const emptyStateRows = ctx.entities.slice(0, 3).map(e =>
    `| ${e} List | No ${e.toLowerCase()}s yet | Create your first ${e.toLowerCase()} | /${e.toLowerCase()}s/new |`
  ).join('\n');

  const confirmRows = ctx.entities.slice(0, 2).map(e =>
    `| Delete ${e.toLowerCase()} | Delete this ${e.toLowerCase()}? | This action cannot be undone. | Delete ${e.toLowerCase()} | Keep ${e.toLowerCase()} |`
  ).join('\n');

  const placeholderRows = ctx.entities.slice(0, 3).map(e =>
    `| ${e} search | Search ${e.toLowerCase()}s... |`
  ).join('\n');

  const loadingRows = ctx.entities.slice(0, 2).map(e =>
    `| ${e} list load | — (show skeleton) | Still loading — hang tight! |`
  ).join('\n');

  return `# Copy Guide — ${module}

## Overview
**Domain Slug:** ${module}
**Prefix:** ${prefix}
**Project:** ${ctx.name}

---

## Tone & Voice

- **Voice characteristics:** Friendly and encouraging, professional but approachable
- **Formality level:** Casual — use contractions, avoid jargon
- **Target reading level:** General audience (8th grade level)
- **Brand personality:** Helpful expert who speaks plainly

### Forbidden Patterns
- Technical error codes shown to users
- Passive voice in CTAs (use "Create" not "can be created")
- ALL CAPS for emphasis (use bold instead)

### Writing Rules
- Sentence case for all headings (not Title Case)
- Use "you/your" for user-facing copy
- Keep error messages under 20 words

---

## Page Titles & Headings

| Screen Ref | Page Title (browser tab) | Main Heading | Subheading |
|-----------|------------------------|-------------|-----------|
${titleRows}

---

## Labels & Headings

| Element ID | Context | Copy Text | Notes |
|-----------|---------|-----------|-------|
${labelRows}

---

## Error Messages

| Error Code | User-Facing Message | Recovery Action Text | Severity |
|-----------|-------------------|---------------------|----------|
${errorMsgRows}

---

## Success Messages

| Action | Message | Display Method | Duration |
|--------|---------|---------------|----------|
${successRows}

---

## Empty States

| Screen/Component | Empty State Message | Call to Action | CTA Target |
|-----------------|-------------------|---------------|-----------|
${emptyStateRows}

---

## Confirmation Dialogs

| Action | Dialog Title | Dialog Message | Confirm Button | Cancel Button |
|--------|-------------|---------------|---------------|--------------|
${confirmRows}

---

## Placeholder Text

| Input | Placeholder Text |
|-------|-----------------|
${placeholderRows}

---

## Loading & Progress Messages

| Action | Loading Message | Long Wait Message (>5s) |
|--------|----------------|----------------------|
${loadingRows}

---

## Open Questions
- Brand voice specifics pending RPBS §10 definition
- Error message copy needs review against BELS reason codes
`;
}

function loadKnowledgeMapForDomain(module) {
  try {
    const mapPath = path.join('axion', 'config', 'knowledge-map.json');
    if (!fs.existsSync(mapPath)) return null;
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    return map.domain_knowledge?.[module] || null;
  } catch { return null; }
}

function generateDomainReadme(module, ctx) {
  const modDdes = MODULE_DDES_CONTENT[module] || {
    purpose: `Manages ${module} domain concerns for ${ctx.name}`,
    responsibilities: [`Handle ${module}-specific operations`, `Validate ${module} domain data`, `Coordinate with dependent modules`],
  };

  const responsibilities = modDdes.responsibilities.map(r => `- ${r}`).join('\n');
  const entityList = ctx.entities.slice(0, 5).map(e => `- ${e}`).join('\n');

  const knowledgeEntry = loadKnowledgeMapForDomain(module);
  let knowledgeSection = '';
  if (knowledgeEntry) {
    const primaryList = knowledgeEntry.primary.map(f => `- \`knowledge/${f}\` (primary)`).join('\n');
    const secondaryList = knowledgeEntry.secondary.map(f => `- \`knowledge/${f}\` (secondary)`).join('\n');
    knowledgeSection = `
## Knowledge Base References
<!-- AXION:KNOWLEDGE_REF:${module} -->
The following knowledge files contain best practices relevant to this domain:

**Primary (read first):**
${primaryList}

**Secondary (consult as needed):**
${secondaryList}

Focus: ${knowledgeEntry.purpose}
`;
  }

  return `# ${module} Domain — ${ctx.name}

## Purpose
${modDdes.purpose}

## Key Responsibilities
${responsibilities}

## Core Entities
${entityList}

## Documents in This Domain
- **BELS** — Business Entity Logic Specification (policy rules, state machines, validation)
- **DDES** — Domain Design & Entity Specification (entities, responsibilities, boundaries)
- **DIM** — Domain Interface Map (exposed/consumed interfaces, event contracts)
- **UX_Foundations** — User experience laws, mental model, intent loop, cognitive load, feedback, error, trust, flow
- **UI_Constraints** — Structural grouping, navigation constraints, interaction limits, state visibility, timing rules
- **SCREENMAP** — Screen inventory and navigation flows
- **TESTPLAN** — Test strategy and acceptance scenarios
- **COMPONENT_LIBRARY** — Reusable UI component catalog
- **COPY_GUIDE** — User-facing text, labels, and messaging
- **OPEN_QUESTIONS** — Unresolved questions blocking lock step

## System-Level Documents (Kit-Wide)
- **ERC** — Execution Readiness Contract (auto-generated at lock time — frozen meaning contract)
- **ALRP** — Agent Lifecycle & Reasoning Protocol (cognitive discipline, phase behavior, input authority)
- **SROL** — Structured Refinement & Optimization Loop (diagnostic-first refinement with 4 lenses)
- **TIES** — Technical Implementation & Engineering Standards (12 engineering disciplines)
${knowledgeSection}
## Status
DRAFT — Generated by axion:draft pipeline step
`;
}

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:draft`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);
  console.log(`\nCreated (${receipt.createdFiles.length}):`);
  receipt.createdFiles.forEach(f => console.log(`  + ${f}`));
  console.log(`\nModified (${receipt.modifiedFiles.length}):`);
  receipt.modifiedFiles.forEach(f => console.log(`  ~ ${f}`));
  console.log(`\nSkipped (${receipt.skippedFiles.length}):`);
  receipt.skippedFiles.forEach(f => console.log(`  - ${f}`));
  if (receipt.warnings.length) {
    console.log(`\nWarnings (${receipt.warnings.length}):`);
    receipt.warnings.forEach(w => console.log(`  ? ${w}`));
  }
  if (receipt.errors.length) {
    console.log(`\nErrors (${receipt.errors.length}):`);
    receipt.errors.forEach(e => console.log(`  ! ${e}`));
  }
  console.log(`\nResult: ${receipt.ok ? 'OK' : 'FAILED'}`);
  console.log('===================================');
}

try {
  if (!jsonMode) console.log('Running axion:draft...');

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');

  const ctx = parseProjectContext();

  if (ctx.upgrade.isUpgrade && !jsonMode) {
    console.log(`  Upgrade mode: revision=${ctx.upgrade.revision}, kitType=${ctx.upgrade.kitType}`);
    console.log(`  Upgrade notes: ${ctx.upgrade.upgradeNotes.slice(0, 100)}${ctx.upgrade.upgradeNotes.length > 100 ? '...' : ''}`);
  }

  let rpbsContent = '';
  let rebsContent = '';
  const rpbsPath = path.join(axionRoot, 'docs/product/RPBS_Product.md');
  const rebsPath = path.join(axionRoot, 'docs/product/REBS_Product.md');
  if (fs.existsSync(rpbsPath)) rpbsContent = fs.readFileSync(rpbsPath, 'utf8');
  if (fs.existsSync(rebsPath)) rebsContent = fs.readFileSync(rebsPath, 'utf8');

  const rebsEntities = extractEntitiesFromREBS(rebsContent);
  if (rebsEntities.length > 0 && ctx.entities.length < rebsEntities.length) {
    for (const e of rebsEntities) {
      if (!ctx.entities.includes(e)) ctx.entities.push(e);
    }
  }

  const rpbsRules = extractRulesFromRPBS(rpbsContent);

  for (const module of modules) {
    if (!isStageDone('seed', module)) {
      const msg = `Module '${module}' has not completed 'seed'. Run: node axion/scripts/axion-seed.mjs --module ${module}`;
      receipt.errors.push(msg);
      receipt.ok = false;
      if (!dryRun) markStageFailed('draft', module, { reason: msg });
      continue;
    }

    try {
      ensurePrereqs({
        stageName: 'draft',
        module,
        stagePrereq: (m) => isStageDone('seed', m),
      });
    } catch (prereqErr) {
      receipt.errors.push(`Prerequisite failed for module '${module}': ${prereqErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('draft', module, { reason: prereqErr.message });
      continue;
    }

    try {
      if (!jsonMode) console.log(`Drafting module: ${module}`);
      receipt.modulesProcessed.push(module);

      const domainDir = path.join(domainsDir, module);
      const domainPrefix = getDomainPrefix(config, module);

      const belsContent = generateBELSCandidates(module, ctx, rpbsRules);
      const belsPath = path.join(domainDir, `BELS_${module}.md`);
      ensureFileWithMerge(belsPath, belsContent, BELS_SECTION_MAP);

      const ddesContent = generateDDES(module, ctx);
      const ddesPath = path.join(domainDir, `DDES_${module}.md`);
      ensureFileWithMerge(ddesPath, ddesContent, DDES_SECTION_MAP);

      const dimContent = generateDIM(module, ctx, rpbsRules, domainPrefix);
      const dimPath = path.join(domainDir, `DIM_${module}.md`);
      ensureFileWithMerge(dimPath, dimContent, DIM_SECTION_MAP);

      const uxContent = generateUXFoundations(module, ctx);
      const uxPath = path.join(domainDir, `UX_Foundations_${module}.md`);
      ensureFileWithMerge(uxPath, uxContent, UX_FOUNDATIONS_SECTION_MAP);

      const uiContent = generateUIConstraints(module, ctx);
      const uiPath = path.join(domainDir, `UI_Constraints_${module}.md`);
      ensureFileWithMerge(uiPath, uiContent, UI_CONSTRAINTS_SECTION_MAP);

      const screenmapContent = generateScreenmap(module, ctx, domainPrefix);
      const screenmapPath = path.join(domainDir, `SCREENMAP_${module}.md`);
      ensureFileWithMerge(screenmapPath, screenmapContent, SCREENMAP_SECTION_MAP);

      const testplanContent = generateTestplan(module, ctx, rpbsRules, domainPrefix);
      const testplanPath = path.join(domainDir, `TESTPLAN_${module}.md`);
      ensureFileWithMerge(testplanPath, testplanContent, TESTPLAN_SECTION_MAP);

      const componentContent = generateComponentLibrary(module, ctx, domainPrefix);
      const componentPath = path.join(domainDir, `COMPONENT_LIBRARY_${module}.md`);
      ensureFileWithMerge(componentPath, componentContent, COMPONENT_LIBRARY_SECTION_MAP);

      const copyContent = generateCopyGuide(module, ctx, domainPrefix);
      const copyPath = path.join(domainDir, `COPY_GUIDE_${module}.md`);
      ensureFileWithMerge(copyPath, copyContent, COPY_GUIDE_SECTION_MAP);

      const readmeContent = generateDomainReadme(module, ctx);
      const readmePath = path.join(domainDir, `README_${module}.md`);
      ensureFile(readmePath, readmeContent);

      const openQuestionsContent = generateOpenQuestions(module, ctx);
      const openQuestionsPath = path.join(domainDir, `OPEN_QUESTIONS_${module}.md`);
      ensureFile(openQuestionsPath, openQuestionsContent);

      if (!dryRun) {
        markStageDone('draft', module);
      }
    } catch (moduleErr) {
      receipt.errors.push(`Module '${module}' failed: ${moduleErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('draft', module, { reason: moduleErr.message });
    }
  }

  emitOutput();

  if (!receipt.ok) process.exit(1);

} catch (error) {
  receipt.ok = false;
  receipt.errors.push(error.message);
  emitOutput();
  process.exit(1);
}
