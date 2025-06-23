/**
 * Developer Tools Demo
 * Demonstrates the usage of LSP, Syntax Highlighter, and Formatter
 */

import { FormulaDeveloperTools, createDeveloperTools } from './developer-tools.js';

// Sample database schema for testing
const sampleSchema = {
  customer: {
    columns: [
      { column_name: 'id', data_type: 'integer' },
      { column_name: 'name', data_type: 'varchar' },
      { column_name: 'email', data_type: 'varchar' },
      { column_name: 'phone', data_type: 'varchar' },
      { column_name: 'budget', data_type: 'numeric' }
    ],
    directRelationships: [
      { relationship_name: 'opportunities', target_table_name: 'opportunity' }
    ]
  },
  opportunity: {
    columns: [
      { column_name: 'id', data_type: 'integer' },
      { column_name: 'amount', data_type: 'numeric' },
      { column_name: 'status', data_type: 'varchar' },
      { column_name: 'close_date', data_type: 'date' }
    ],
    directRelationships: [
      { relationship_name: 'customer', target_table_name: 'customer' }
    ]
  }
};

// Sample formulas to test
const testFormulas = [
  'IF(amount > 100000, "High Value", "Standard")',
  'UPPER(name) & " - " & email',
  'SUM(opportunities_rel, amount)',
  'COUNT(opportunities_rel)',
  'ROUND(amount / 1000, 2)',
  'customer_rel.name & " has budget of " & STRING(customer_rel.budget)',
  'DATE_DIFF(close_date, TODAY())',
  // Intentionally malformed for testing error detection
  'IF(amount >, "Error")',
  'UNKNOWN_FUNCTION(test)',
  'customer_rel.nonexistent_field'
];

/**
 * Demonstrate LSP functionality
 */
function demonstrateLSP() {
  console.log('\n=== LSP DEMONSTRATION ===\n');
  
  const tools = createDeveloperTools('default', sampleSchema);
  
  testFormulas.forEach((formula, index) => {
    console.log(`Formula ${index + 1}: ${formula}`);
    
    // Get diagnostics
    const diagnostics = tools.getDiagnostics(formula, 'customer');
    console.log(`  Diagnostics: ${diagnostics.length} issues`);
    diagnostics.forEach(diag => {
      console.log(`    ${diag.severity.toUpperCase()}: ${diag.message} (${diag.source})`);
    });
    
    // Get completions at various positions
    if (formula.length > 5) {
      const midPoint = Math.floor(formula.length / 2);
      const completions = tools.getCompletions(formula, midPoint, 'customer');
      console.log(`  Completions at position ${midPoint}: ${completions.length} suggestions`);
      
      // Show first few completions
      const topCompletions = completions.slice(0, 3);
      topCompletions.forEach(comp => {
        console.log(`    ${comp.kind}: ${comp.label} - ${comp.detail || comp.documentation}`);
      });
    }
    
    console.log('');
  });
}

/**
 * Demonstrate Syntax Highlighting
 */
function demonstrateSyntaxHighlighting() {
  console.log('\n=== SYNTAX HIGHLIGHTING DEMONSTRATION ===\n');
  
  const tools = createDeveloperTools('default', sampleSchema);
  
  testFormulas.slice(0, 5).forEach((formula, index) => {
    console.log(`Formula ${index + 1}: ${formula}`);
    
    // Get highlighted tokens
    const tokens = tools.highlight(formula, 'customer');
    console.log(`  Tokens (${tokens.length}):`);
    
    tokens.forEach(token => {
      const metadata = token.metadata ? 
        ` [${Object.entries(token.metadata).map(([k,v]) => `${k}:${v}`).join(', ')}]` : '';
      console.log(`    ${token.type}: "${token.value}" pos:${token.position}-${token.position + token.length}${metadata}`);
    });
    
    // Generate HTML (showing structure, not actual HTML output)
    const html = tools.highlightToHTML(formula, 'customer');
    console.log(`  HTML length: ${html.length} characters`);
    
    // Get bracket pairs
    const brackets = tools.getBracketPairs(formula, 'customer');
    console.log(`  Bracket pairs: ${brackets.length}`);
    brackets.forEach(pair => {
      console.log(`    ( at ${pair.open.start} matches ) at ${pair.close.start}`);
    });
    
    console.log('');
  });
}

/**
 * Demonstrate Formatting
 */
function demonstrateFormatting() {
  console.log('\n=== FORMATTING DEMONSTRATION ===\n');
  
  const tools = createDeveloperTools('default', sampleSchema);
  
  // Test with messy formulas
  const messyFormulas = [
    '   IF(amount>100000,"High Value","Standard")   ',
    'UPPER(name)&" - "&email',
    'SUM(  opportunities_rel  ,  amount  )',
    'IF( status = "Active" AND amount > 50000 , "Priority" , "Normal" )',
    'ROUND(amount/1000,2)'
  ];
  
  messyFormulas.forEach((formula, index) => {
    console.log(`Original ${index + 1}: "${formula}"`);
    
    const formatted = tools.format(formula);
    console.log(`Formatted:     "${formatted}"`);
    
    const isAlreadyFormatted = tools.isFormatted(formula);
    console.log(`Was formatted: ${isAlreadyFormatted}`);
    console.log(`Changed:       ${formula !== formatted}`);
    
    // Test different formatting styles
    const compact = tools.formatWith(formula, { spaceAroundOperators: false });
    const expanded = tools.formatWith(formula, { 
      spaceAroundOperators: true, 
      spaceInsideParentheses: true 
    });
    
    console.log(`Compact:       "${compact}"`);
    console.log(`Expanded:      "${expanded}"`);
    console.log('');
  });
}

/**
 * Demonstrate Combined Analysis
 */
function demonstrateCombinedAnalysis() {
  console.log('\n=== COMBINED ANALYSIS DEMONSTRATION ===\n');
  
  const tools = createDeveloperTools('default', sampleSchema);
  
  testFormulas.slice(0, 3).forEach((formula, index) => {
    console.log(`=== Analysis ${index + 1}: ${formula} ===`);
    
    // Comprehensive analysis
    const analysis = tools.analyze(formula, 'customer');
    console.log(`Length: ${analysis.length} characters`);
    console.log(`Tokens: ${analysis.tokenCount}`);
    console.log(`Errors: ${analysis.hasErrors}`);
    console.log(`Warnings: ${analysis.hasWarnings}`);
    console.log(`Formatted: ${analysis.isFormatted}`);
    
    // Enhanced completions (simulate cursor at end)
    const enhanced = tools.getEnhancedCompletions(formula, formula.length, 'customer');
    console.log(`Total completions: ${enhanced.totalCompletions}`);
    console.log(`Functions: ${enhanced.functionCompletions}`);
    console.log(`Columns: ${enhanced.columnCompletions}`);
    console.log(`Relationships: ${enhanced.relationshipCompletions}`);
    
    // Format and validate
    const formatResult = tools.formatAndValidate(formula, 'customer');
    console.log(`Format changed: ${formatResult.changed}`);
    console.log(`Valid after format: ${formatResult.valid}`);
    console.log(`Errors: ${formatResult.improvement.errorCount}`);
    console.log(`Warnings: ${formatResult.improvement.warningCount}`);
    
    // Create formatted highlight
    const highlight = tools.createFormattedHighlight(formula, 'customer', true);
    console.log(`Was formatted: ${highlight.wasFormatted}`);
    console.log(`Has errors: ${highlight.hasErrors}`);
    console.log(`HTML preview: ${highlight.html.substring(0, 100)}...`);
    
    console.log('');
  });
}

/**
 * Demonstrate Configuration Options
 */
function demonstrateConfiguration() {
  console.log('\n=== CONFIGURATION DEMONSTRATION ===\n');
  
  // Create tools with different presets
  const defaultTools = createDeveloperTools('default', sampleSchema);
  const compactTools = createDeveloperTools('compact', sampleSchema);
  const expandedTools = createDeveloperTools('expanded', sampleSchema);
  
  const testFormula = 'IF(amount > 100000, "High", "Low")';
  
  console.log(`Test formula: ${testFormula}`);
  console.log('');
  
  console.log('Default formatting:');
  console.log(`  "${defaultTools.format(testFormula)}"`);
  
  console.log('Compact formatting:');
  console.log(`  "${compactTools.format(testFormula)}"`);
  
  console.log('Expanded formatting:');
  console.log(`  "${expandedTools.format(testFormula)}"`);
  
  // Show configuration
  const config = defaultTools.getConfiguration();
  console.log('\nDefault configuration:');
  console.log(`  Has schema: ${config.hasSchema}`);
  console.log(`  Uppercase functions: ${config.formatting.uppercaseFunctions}`);
  console.log(`  Space around operators: ${config.formatting.spaceAroundOperators}`);
  console.log(`  Max line length: ${config.formatting.maxLineLength}`);
  
  // Show available styles
  const styles = defaultTools.getFormattingStyles();
  console.log('\nAvailable formatting styles:');
  Object.keys(styles).forEach(style => {
    console.log(`  ${style}: ${Object.keys(styles[style]).length} options`);
  });
}

/**
 * Run all demonstrations
 */
function runDemo() {
  console.log('🚀 Formula Language Developer Tools Demo');
  console.log('==========================================');
  
  try {
    demonstrateLSP();
    demonstrateSyntaxHighlighting();
    demonstrateFormatting();
    demonstrateCombinedAnalysis();
    demonstrateConfiguration();
    
    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    console.error(error.stack);
  }
}

// Export for use in other modules
export {
  runDemo,
  demonstrateLSP,
  demonstrateSyntaxHighlighting,
  demonstrateFormatting,
  demonstrateCombinedAnalysis,
  demonstrateConfiguration,
  sampleSchema,
  testFormulas
};

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}