/**
 * Protected Paths Utilities v2.1
 * 
 * Provides utilities for enforcing protected path contracts.
 * Protected paths are a hard Do-Not-Touch contract enforced by
 * reorg/consolidate/reset/purge commands.
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, relative } from 'path';
import { minimatch } from 'minimatch';

const CONFIG_PATH = 'roshi/protected-paths.json';

let cachedConfig = null;

/**
 * Load protected paths configuration
 * @returns {Object} The protected paths config object
 */
export function loadProtectedPaths() {
  if (cachedConfig) return cachedConfig;
  
  const configPath = resolve(process.cwd(), CONFIG_PATH);
  
  if (!existsSync(configPath)) {
    throw new Error(`Protected paths config not found at ${CONFIG_PATH}`);
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8');
    cachedConfig = JSON.parse(content);
    return cachedConfig;
  } catch (err) {
    throw new Error(`Failed to parse ${CONFIG_PATH}: ${err.message}`);
  }
}

/**
 * Check if a path matches any protected pattern
 * @param {string} filePath - The path to check (relative to repo root)
 * @returns {boolean} True if the path is protected
 */
export function isProtected(filePath) {
  const config = loadProtectedPaths();
  const normalizedPath = relative(process.cwd(), resolve(process.cwd(), filePath));
  
  for (const pattern of config.patterns) {
    if (minimatch(normalizedPath, pattern, { dot: true })) {
      return true;
    }
    if (minimatch(filePath, pattern, { dot: true })) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get the category of a protected path
 * @param {string} filePath - The path to check
 * @returns {string|null} The category name or null if not protected
 */
export function getProtectedCategory(filePath) {
  const config = loadProtectedPaths();
  const normalizedPath = relative(process.cwd(), resolve(process.cwd(), filePath));
  
  for (const [category, patterns] of Object.entries(config.categories)) {
    for (const pattern of patterns) {
      if (minimatch(normalizedPath, pattern, { dot: true }) || 
          minimatch(filePath, pattern, { dot: true })) {
        return category;
      }
    }
  }
  
  return null;
}

/**
 * Assert that no operations touch protected paths (fail-fast)
 * @param {Array<{type: string, path: string}>} operations - List of operations with paths
 * @throws {Error} If any operation would touch a protected path
 */
export function assertNoProtectedTouches(operations) {
  const violations = [];
  
  for (const op of operations) {
    const path = op.path || op.source || op.target;
    if (!path) continue;
    
    if (isProtected(path)) {
      const category = getProtectedCategory(path);
      violations.push({
        operation: op.type || 'unknown',
        path,
        category
      });
    }
    
    if (op.target && isProtected(op.target)) {
      const category = getProtectedCategory(op.target);
      violations.push({
        operation: op.type || 'unknown',
        path: op.target,
        category
      });
    }
  }
  
  if (violations.length > 0) {
    const violationList = violations
      .map(v => `  - [${v.category}] ${v.operation}: ${v.path}`)
      .join('\n');
    
    throw new Error(
      `PROTECTED PATH VIOLATION - Operation aborted!\n\n` +
      `The following protected paths would be affected:\n${violationList}\n\n` +
      `Protected paths are a hard Do-Not-Touch contract. ` +
      `Review roshi/protected-paths.json for the full list.`
    );
  }
}

/**
 * Filter out protected paths from a list of paths
 * @param {string[]} paths - List of paths to filter
 * @returns {{allowed: string[], protected: string[]}} Categorized paths
 */
export function filterProtectedPaths(paths) {
  const allowed = [];
  const protectedPaths = [];
  
  for (const path of paths) {
    if (isProtected(path)) {
      protectedPaths.push(path);
    } else {
      allowed.push(path);
    }
  }
  
  return { allowed, protected: protectedPaths };
}

/**
 * Get all protected patterns
 * @returns {string[]} List of all protected patterns
 */
export function getProtectedPatterns() {
  const config = loadProtectedPaths();
  return [...config.patterns];
}

/**
 * Validate that protected paths config is well-formed
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateConfig() {
  const errors = [];
  
  try {
    const config = loadProtectedPaths();
    
    if (!config.version) {
      errors.push('Missing version field');
    }
    
    if (!Array.isArray(config.patterns)) {
      errors.push('patterns must be an array');
    }
    
    if (!config.categories || typeof config.categories !== 'object') {
      errors.push('categories must be an object');
    }
    
    const allCategoryPatterns = Object.values(config.categories || {}).flat();
    for (const pattern of config.patterns || []) {
      if (!allCategoryPatterns.includes(pattern)) {
        errors.push(`Pattern "${pattern}" not assigned to any category`);
      }
    }
    
  } catch (err) {
    errors.push(err.message);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  loadProtectedPaths,
  isProtected,
  getProtectedCategory,
  assertNoProtectedTouches,
  filterProtectedPaths,
  getProtectedPatterns,
  validateConfig
};
