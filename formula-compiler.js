/**
 * JavaScript-based Excel-like Formula Compiler
 * Converts formulas to PostgreSQL SQL without external dependencies
 * 
 * This file now imports from modular components in the src/ directory
 * for better maintainability and organization.
 */

// Import all functionality from the modular structure
import { evaluateFormula, generateSQL, mapPostgresType } from './src/index.js';

// Export for ES modules
export { evaluateFormula, generateSQL, mapPostgresType };