/**
 * Developer Tools Suite for Formula Language
 * Combines LSP, Syntax Highlighter, and Formatter into a unified interface
 */

import { FormulaLanguageServer, CompletionItemKind, DiagnosticSeverity } from './lsp.js';
import { FormulaSyntaxHighlighter, SemanticTokenType, DefaultTheme, DefaultHighlightCSS } from './syntax-highlighter.js';
import { FormulaFormatter, FormattingStyles, DefaultFormattingOptions } from './formatter.js';

/**
 * Unified Developer Tools Suite
 */
export class FormulaDeveloperTools {
  constructor(options = {}) {
    this.lsp = new FormulaLanguageServer(options.schema);
    this.highlighter = new FormulaSyntaxHighlighter(options.theme);
    this.formatter = new FormulaFormatter(options.formatting);
    
    // Keep schema in sync across tools
    if (options.schema) {
      this.updateSchema(options.schema);
    }
  }

  /**
   * Update database schema for all tools
   */
  updateSchema(schema) {
    this.lsp.updateSchema(schema);
    this.highlighter.updateSchema(schema);
  }

  // =============================================================================
  // LSP FUNCTIONALITY
  // =============================================================================

  /**
   * Get autocomplete suggestions
   * @param {string} text - Formula text
   * @param {number} position - Cursor position
   * @param {string} tableName - Current table name
   * @returns {Array} Completion items
   */
  getCompletions(text, position, tableName = null) {
    return this.lsp.getCompletions(text, position, tableName);
  }

  /**
   * Get diagnostics (errors/warnings)
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {Array} Diagnostic messages
   */
  getDiagnostics(text, tableName = null) {
    return this.lsp.getDiagnostics(text, tableName);
  }

  /**
   * Get hover information
   * @param {string} text - Formula text
   * @param {number} position - Cursor position
   * @returns {Object|null} Hover information
   */
  getHover(text, position) {
    return this.lsp.getHover(text, position);
  }

  // =============================================================================
  // SYNTAX HIGHLIGHTING FUNCTIONALITY
  // =============================================================================

  /**
   * Highlight formula and return tokens
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {Array} Highlighted tokens
   */
  highlight(text, tableName = null) {
    return this.highlighter.highlight(text, tableName);
  }

  /**
   * Generate HTML with syntax highlighting
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {string} HTML with highlighting
   */
  highlightToHTML(text, tableName = null) {
    return this.highlighter.toHTML(text, tableName);
  }

  /**
   * Get bracket matching pairs
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {Array} Bracket pairs
   */
  getBracketPairs(text, tableName = null) {
    return this.highlighter.getBracketPairs(text, tableName);
  }

  // =============================================================================
  // FORMATTING FUNCTIONALITY
  // =============================================================================

  /**
   * Format formula text
   * @param {string} text - Formula text to format
   * @returns {string} Formatted text
   */
  format(text) {
    return this.formatter.format(text);
  }

  /**
   * Check if text is already formatted
   * @param {string} text - Formula text
   * @returns {boolean} True if already formatted
   */
  isFormatted(text) {
    return this.formatter.isFormatted(text);
  }

  /**
   * Format with custom options
   * @param {string} text - Formula text
   * @param {Object} options - Formatting options
   * @returns {string} Formatted text
   */
  formatWith(text, options) {
    return this.formatter.formatWith(text, options);
  }

  // =============================================================================
  // COMBINED FUNCTIONALITY
  // =============================================================================

  /**
   * Analyze formula comprehensively
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {Object} Complete analysis
   */
  analyze(text, tableName = null) {
    const diagnostics = this.getDiagnostics(text, tableName);
    const tokens = this.highlight(text, tableName);
    const isFormatted = this.isFormatted(text);
    
    return {
      text,
      tableName,
      tokens,
      diagnostics,
      hasErrors: diagnostics.some(d => d.severity === DiagnosticSeverity.ERROR),
      hasWarnings: diagnostics.some(d => d.severity === DiagnosticSeverity.WARNING),
      isFormatted,
      length: text.length,
      tokenCount: tokens.length
    };
  }

  /**
   * Get comprehensive completions with enhanced information
   * @param {string} text - Formula text
   * @param {number} position - Cursor position
   * @param {string} tableName - Current table name
   * @returns {Object} Enhanced completion results
   */
  getEnhancedCompletions(text, position, tableName = null) {
    const completions = this.getCompletions(text, position, tableName);
    const context = this.lsp.analyzeContext(text, position);
    const diagnostics = this.getDiagnostics(text, tableName);
    
    return {
      completions,
      context,
      hasErrors: diagnostics.some(d => d.severity === DiagnosticSeverity.ERROR),
      totalCompletions: completions.length,
      functionCompletions: completions.filter(c => c.kind === CompletionItemKind.FUNCTION).length,
      columnCompletions: completions.filter(c => c.kind === CompletionItemKind.FIELD).length,
      relationshipCompletions: completions.filter(c => c.kind === CompletionItemKind.RELATIONSHIP).length
    };
  }

  /**
   * Format and validate formula
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @returns {Object} Format and validation results
   */
  formatAndValidate(text, tableName = null) {
    const original = text;
    const formatted = this.format(text);
    const diagnostics = this.getDiagnostics(formatted, tableName);
    
    return {
      original,
      formatted,
      changed: original !== formatted,
      valid: !diagnostics.some(d => d.severity === DiagnosticSeverity.ERROR),
      diagnostics,
      improvement: {
        errorCount: diagnostics.filter(d => d.severity === DiagnosticSeverity.ERROR).length,
        warningCount: diagnostics.filter(d => d.severity === DiagnosticSeverity.WARNING).length
      }
    };
  }

  /**
   * Create formatted code with highlighting
   * @param {string} text - Formula text
   * @param {string} tableName - Current table name
   * @param {boolean} autoFormat - Whether to format before highlighting
   * @returns {Object} Formatted and highlighted code
   */
  createFormattedHighlight(text, tableName = null, autoFormat = true) {
    const workingText = autoFormat ? this.format(text) : text;
    const html = this.highlightToHTML(workingText, tableName);
    const diagnostics = this.getDiagnostics(workingText, tableName);
    
    return {
      original: text,
      formatted: workingText,
      html,
      wasFormatted: autoFormat && text !== workingText,
      diagnostics,
      hasErrors: diagnostics.some(d => d.severity === DiagnosticSeverity.ERROR)
    };
  }

  // =============================================================================
  // CONFIGURATION
  // =============================================================================

  /**
   * Set formatting options
   * @param {Object} options - Formatting options
   */
  setFormattingOptions(options) {
    this.formatter.setOptions(options);
  }

  /**
   * Set highlighting theme
   * @param {Object} theme - Theme object
   */
  setHighlightingTheme(theme) {
    this.highlighter.theme = { ...DefaultTheme, ...theme };
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfiguration() {
    return {
      formatting: this.formatter.getOptions(),
      highlighting: this.highlighter.theme,
      hasSchema: !!this.lsp.schema
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate CSS for syntax highlighting
   * @returns {string} CSS text
   */
  generateHighlightCSS() {
    return DefaultHighlightCSS;
  }

  /**
   * Get available formatting styles
   * @returns {Object} Available formatting styles
   */
  getFormattingStyles() {
    return FormattingStyles;
  }

  /**
   * Get completion item kinds
   * @returns {Object} Completion item kinds
   */
  getCompletionItemKinds() {
    return CompletionItemKind;
  }

  /**
   * Get diagnostic severities
   * @returns {Object} Diagnostic severities
   */
  getDiagnosticSeverities() {
    return DiagnosticSeverity;
  }

  /**
   * Get semantic token types
   * @returns {Object} Semantic token types
   */
  getSemanticTokenTypes() {
    return SemanticTokenType;
  }
}

/**
 * Create developer tools with preset configuration
 * @param {string} preset - Preset name ('default', 'compact', 'expanded')
 * @param {Object} schema - Database schema
 * @returns {FormulaDeveloperTools} Configured developer tools
 */
export function createDeveloperTools(preset = 'default', schema = null) {
  const configs = {
    default: {
      formatting: DefaultFormattingOptions,
      theme: DefaultTheme
    },
    compact: {
      formatting: FormattingStyles.COMPACT,
      theme: DefaultTheme
    },
    expanded: {
      formatting: FormattingStyles.EXPANDED,
      theme: DefaultTheme
    },
    minimal: {
      formatting: FormattingStyles.MINIMAL,
      theme: DefaultTheme
    }
  };

  const config = configs[preset] || configs.default;
  
  return new FormulaDeveloperTools({
    schema,
    formatting: config.formatting,
    theme: config.theme
  });
}

// Export individual tools and utilities
export {
  FormulaLanguageServer,
  FormulaSyntaxHighlighter,
  FormulaFormatter,
  CompletionItemKind,
  DiagnosticSeverity,
  SemanticTokenType,
  DefaultTheme,
  FormattingStyles,
  DefaultFormattingOptions,
  DefaultHighlightCSS
};