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
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  failJson,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const { modules } = parseModuleArgs(process.argv);

const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
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
    report.modified.push(filePath);
    return true;
  }
  
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
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
  const idea = process.env.AXION_PROJECT_IDEA || '';
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

function generateDIM(module, ctx) {
  const modDim = MODULE_DIM_CONTENT[module] || { exposedType: 'REST', consumedFrom: 'contracts' };
  const prefix = module.substring(0, 2).toLowerCase();

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

function printReport(hasFailed = false) {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:draft`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${hasFailed ? 'FAILED' : 'SUCCESS'}`);
  console.log(`Modules: ${modules.join(', ')}`);
  console.log(`\nCreated (${report.created.length}):`);
  report.created.forEach(f => console.log(`  + ${f}`));
  console.log(`\nModified (${report.modified.length}):`);
  report.modified.forEach(f => console.log(`  ~ ${f}`));
  console.log(`\nSkipped (${report.skipped.length}):`);
  report.skipped.forEach(f => console.log(`  - ${f}`));
  console.log(`\nFailed (${report.failed.length}):`);
  report.failed.forEach(f => console.log(`  ! ${f}`));
  console.log('\n===================================');
}

try {
  console.log('Running axion:draft...');
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');

  const ctx = parseProjectContext();

  if (ctx.upgrade.isUpgrade) {
    console.log(`  Upgrade mode: revision=${ctx.upgrade.revision}, kitType=${ctx.upgrade.kitType}`);
    console.log(`  Upgrade notes: ${ctx.upgrade.upgradeNotes.slice(0, 100)}${ctx.upgrade.upgradeNotes.length > 100 ? '...' : ''}`);
  }

  let rpbsContent = '';
  let rebsContent = '';
  const rpbsPath = path.join(axionRoot, 'source_docs/product/RPBS_Product.md');
  const rebsPath = path.join(axionRoot, 'source_docs/product/REBS_Product.md');
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
    ensurePrereqs({
      stageName: 'draft',
      module,
      stagePrereq: (m) => isStageDone('seed', m),
    });
    
    console.log(`Drafting module: ${module}`);
    
    const domainDir = path.join(domainsDir, module);
    
    const belsContent = generateBELSCandidates(module, ctx, rpbsRules);
    const belsPath = path.join(domainDir, `BELS_${module}.md`);
    ensureFile(belsPath, belsContent);
    
    const ddesContent = generateDDES(module, ctx);
    const ddesPath = path.join(domainDir, `DDES_${module}.md`);
    ensureFile(ddesPath, ddesContent);
    
    const dimContent = generateDIM(module, ctx);
    const dimPath = path.join(domainDir, `DIM_${module}.md`);
    ensureFile(dimPath, dimContent);
    
    const openQuestionsContent = generateOpenQuestions(module, ctx);
    const openQuestionsPath = path.join(domainDir, `OPEN_QUESTIONS_${module}.md`);
    ensureFile(openQuestionsPath, openQuestionsContent);
    
    if (!dryRun) {
      markStageDone('draft', module);
    }
  }
  
  printReport(false);
  
} catch (error) {
  report.failed.push(error.message);
  printReport(true);
  process.exit(1);
}
