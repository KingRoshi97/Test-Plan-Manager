/**
 * Project Overview Parser v2.1
 * 
 * Deterministic parsing of domains list from Project Overview.
 * Model B control plane: Project Overview is the canonical starting truth.
 * 
 * If unknown/missing, write UNKNOWN + Open Questions and stop.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const WORKSPACE_PATHS = [
  'docs/roshi_v2/00_product/PROJECT_OVERVIEW.md',
  'docs/assembler_v1/00_product/PROJECT_OVERVIEW.md'
];

/**
 * Domain extraction patterns in priority order
 */
const DOMAIN_PATTERNS = [
  {
    name: 'h2_domains',
    regex: /^## Domains?\s*\n([\s\S]*?)(?=\n## |\n$|$)/im,
    description: 'H2 heading "## Domains"'
  },
  {
    name: 'h3_domain_list',
    regex: /^### Domain List\s*\n([\s\S]*?)(?=\n### |\n## |\n$|$)/im,
    description: 'H3 heading "### Domain List"'
  },
  {
    name: 'bold_domains',
    regex: /\*\*Domains?\*\*:\s*([\s\S]*?)(?=\n\*\*|\n## |\n$|$)/im,
    description: 'Bold label "**Domains**:"'
  },
  {
    name: 'table_domains',
    regex: /\|\s*Domain\s*\|[\s\S]*?\n((?:\|[^\n]+\|\n)+)/im,
    description: 'Markdown table with Domain column'
  }
];

/**
 * Extract domain slugs from a section of text
 */
function extractDomainsFromSection(section, patternName) {
  const domains = [];
  
  if (patternName === 'table_domains') {
    const rows = section.split('\n').filter(r => r.trim().startsWith('|'));
    for (const row of rows) {
      if (row.includes('---')) continue;
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length > 0) {
        const slug = cells[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (slug && slug !== 'domain') {
          domains.push(slug);
        }
      }
    }
  } else {
    const lines = section.split('\n');
    
    for (const line of lines) {
      const bulletMatch = line.match(/^[-*]\s+\**(\w[\w\s/&-]*)\**/);
      if (bulletMatch) {
        const slug = bulletMatch[1]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        if (slug) {
          domains.push(slug);
        }
        continue;
      }
      
      const numberedMatch = line.match(/^\d+\.\s+\**(\w[\w\s/&-]*)\**/);
      if (numberedMatch) {
        const slug = numberedMatch[1]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        if (slug) {
          domains.push(slug);
        }
        continue;
      }
      
      const inlineMatch = line.match(/`(\w+)`/g);
      if (inlineMatch) {
        for (const match of inlineMatch) {
          const slug = match.replace(/`/g, '').toLowerCase();
          if (slug.length >= 2 && slug.length <= 30) {
            domains.push(slug);
          }
        }
      }
    }
  }
  
  return [...new Set(domains)];
}

/**
 * Parse Project Overview and extract domains
 * @param {string} [overviewPath] - Optional explicit path to overview file
 * @returns {{
 *   found: boolean,
 *   domains: string[],
 *   source: string|null,
 *   pattern: string|null,
 *   openQuestions: string[]
 * }}
 */
export function parseProjectOverview(overviewPath = null) {
  let content = null;
  let sourcePath = null;
  
  if (overviewPath && existsSync(overviewPath)) {
    content = readFileSync(overviewPath, 'utf-8');
    sourcePath = overviewPath;
  } else {
    for (const path of WORKSPACE_PATHS) {
      if (existsSync(path)) {
        content = readFileSync(path, 'utf-8');
        sourcePath = path;
        break;
      }
    }
  }
  
  if (!content) {
    return {
      found: false,
      domains: [],
      source: null,
      pattern: null,
      openQuestions: ['PROJECT_OVERVIEW.md not found - create it first']
    };
  }
  
  for (const pattern of DOMAIN_PATTERNS) {
    const match = content.match(pattern.regex);
    if (match) {
      const section = match[1];
      const domains = extractDomainsFromSection(section, pattern.name);
      
      if (domains.length > 0) {
        const unknownIndex = domains.indexOf('unknown');
        if (unknownIndex !== -1 && domains.length === 1) {
          return {
            found: false,
            domains: [],
            source: sourcePath,
            pattern: pattern.name,
            openQuestions: ['Domain list contains only UNKNOWN - define actual domains']
          };
        }
        
        return {
          found: true,
          domains: domains.filter(d => d !== 'unknown'),
          source: sourcePath,
          pattern: pattern.name,
          openQuestions: []
        };
      }
    }
  }
  
  return {
    found: false,
    domains: [],
    source: sourcePath,
    pattern: null,
    openQuestions: [
      'No domain list found in PROJECT_OVERVIEW.md',
      'Add a "## Domains" section with bullet points or numbered list'
    ]
  };
}

/**
 * Validate that sources.json has Project Overview first (Model B requirement)
 * @param {string} [sourcesPath] - Path to sources.json
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateOverviewFirst(sourcesPath = 'roshi/sources.json') {
  const altPath = 'assembler/sources.json';
  
  let content = null;
  let usedPath = null;
  
  if (existsSync(sourcesPath)) {
    content = readFileSync(sourcesPath, 'utf-8');
    usedPath = sourcesPath;
  } else if (existsSync(altPath)) {
    content = readFileSync(altPath, 'utf-8');
    usedPath = altPath;
  } else {
    return {
      valid: false,
      error: 'sources.json not found'
    };
  }
  
  try {
    const sources = JSON.parse(content);
    const sourceList = sources.sources || sources;
    
    if (!Array.isArray(sourceList) || sourceList.length === 0) {
      return {
        valid: false,
        error: 'sources.json has no sources array'
      };
    }
    
    const first = sourceList[0];
    const firstId = typeof first === 'string' ? first : (first.id || first.name || '');
    
    if (!firstId.toLowerCase().includes('overview') && 
        !firstId.toLowerCase().includes('project')) {
      return {
        valid: false,
        error: `First source must be Project Overview, got: ${firstId}`
      };
    }
    
    return { valid: true, error: null };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to parse sources.json: ${err.message}`
    };
  }
}

/**
 * Generate domains.json from parsed domains
 */
export function generateDomainsJson(domains) {
  return {
    version: '2.1',
    generatedAt: new Date().toISOString(),
    source: 'PROJECT_OVERVIEW.md',
    domains: domains.map((slug, index) => ({
      slug,
      label: slug
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      order: index + 1,
      status: 'pending'
    }))
  };
}

export default {
  parseProjectOverview,
  validateOverviewFirst,
  generateDomainsJson,
  WORKSPACE_PATHS,
  DOMAIN_PATTERNS
};
