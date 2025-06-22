/**
 * LSP Server Tests
 * 
 * Tests for Language Server Protocol functionality
 */

import { Lexer, getFunctionNames, getLiterals } from '../src/lexer.js';
import { Parser } from '../src/parser.js';
import { FUNCTION_METADATA } from '../src/function-metadata.js';

console.log('Running LSP Server Tests...\n');

const tests = [];
let passedTests = 0;

function test(name, testFunction) {
  tests.push({ name, testFunction });
}

function runTests() {
  for (const { name, testFunction } of tests) {
    try {
      testFunction();
      console.log(`✓ Test ${tests.indexOf({ name, testFunction }) + 1}: ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`✗ Test ${tests.indexOf({ name, testFunction }) + 1}: ${name} - ${error.message}`);
    }
  }
}

// Mock LSP utility functions for testing
function mockGetWordAtPosition(text, offset) {
  let start = offset;
  let end = offset;
  
  // Find start of word
  while (start > 0 && /[a-zA-Z_0-9]/.test(text[start - 1])) {
    start--;
  }
  
  // Find end of word
  while (end < text.length && /[a-zA-Z_0-9]/.test(text[end])) {
    end++;
  }
  
  if (start === end) {
    return null;
  }
  
  return {
    word: text.substring(start, end),
    start,
    end
  };
}

function mockGenerateCompletions() {
  const completions = [];
  
  // Add function completions
  const functionNames = getFunctionNames();
  for (const funcName of functionNames) {
    const metadata = FUNCTION_METADATA[funcName];
    if (metadata) {
      completions.push({
        label: funcName,
        kind: 'Function',
        detail: metadata.description,
        documentation: `**${funcName}** - ${metadata.description}`,
        returnType: metadata.returnType.toString ? metadata.returnType.toString() : String(metadata.returnType)
      });
    }
  }
  
  // Add literal completions
  const literals = getLiterals();
  for (const literal of literals) {
    completions.push({
      label: literal,
      kind: 'Constant',
      detail: `${literal} literal`,
      documentation: `Boolean or null literal: ${literal}`
    });
  }
  
  return completions;
}

function mockGenerateHover(word) {
  const upperWord = word.toUpperCase();
  
  // Check if it's a function
  const metadata = FUNCTION_METADATA[upperWord];
  if (metadata) {
    const signatureText = `**${upperWord}**(${metadata.arguments.map(arg => 
      `${arg.name}: ${arg.type.toString ? arg.type.toString() : String(arg.type)}`).join(', ')}) → ${metadata.returnType.toString ? metadata.returnType.toString() : String(metadata.returnType)}`;
    
    return {
      contents: {
        kind: 'markdown',
        value: `${signatureText}\n\n${metadata.description}\n\n**Category:** ${metadata.category}`
      }
    };
  }
  
  // Check if it's a literal
  const literals = getLiterals();
  if (literals.includes(upperWord)) {
    return {
      contents: {
        kind: 'markdown',
        value: `**${upperWord}** - Boolean/null literal`
      }
    };
  }
  
  return null;
}

function mockValidateFormula(text) {
  const diagnostics = [];

  try {
    // Create lexer and parser to check for syntax errors
    const lexer = new Lexer(text);
    const parser = new Parser(lexer);
    
    try {
      const ast = parser.parse();
      // Formula parsed successfully, no syntax errors
      
    } catch (compileError) {
      // Add compilation error as diagnostic
      diagnostics.push({
        severity: 'Error',
        range: {
          start: { line: 0, character: compileError.position || 0 },
          end: { line: 0, character: (compileError.position || 0) + 1 }
        },
        message: compileError.message || 'Compilation error',
        source: 'Formula Language Server'
      });
    }
    
  } catch (parseError) {
    // Add parse error as diagnostic
    diagnostics.push({
      severity: 'Error',
      range: {
        start: { line: 0, character: parseError.position || 0 },
        end: { line: 0, character: (parseError.position || 0) + 1 }
      },
      message: parseError.message || 'Parse error',
      source: 'Formula Language Server'
    });
  }

  return diagnostics;
}

// Test 1: Basic syntax error detection
test('LSP detects basic syntax errors', () => {
  const invalidFormula = 'STRING(';
  const diagnostics = mockValidateFormula(invalidFormula);
  
  if (diagnostics.length === 0) {
    throw new Error('Should detect syntax error in invalid formula');
  }
  
  const diagnostic = diagnostics[0];
  if (!diagnostic.message || !diagnostic.message.includes('Expected')) {
    throw new Error('Should provide meaningful error message');
  }
});

// Test 2: Valid formulas pass validation
test('LSP accepts valid formulas', () => {
  const validFormula = 'STRING(amount)';
  const diagnostics = mockValidateFormula(validFormula);
  
  if (diagnostics.length > 0) {
    throw new Error(`Valid formula should not have errors: ${diagnostics[0].message}`);
  }
});

// Test 3: Autocomplete includes functions
test('Autocomplete includes all function names', () => {
  const completions = mockGenerateCompletions();
  
  // Check for key functions
  const keyFunctions = ['TODAY', 'STRING', 'IF', 'SUM_AGG', 'ROUND'];
  for (const func of keyFunctions) {
    const completion = completions.find(c => c.label === func);
    if (!completion) {
      throw new Error(`Autocomplete should include ${func} function`);
    }
    
    if (!completion.detail || !completion.documentation) {
      throw new Error(`Function ${func} should have detail and documentation`);
    }
  }
});

// Test 4: Autocomplete includes literals
test('Autocomplete includes boolean and null literals', () => {
  const completions = mockGenerateCompletions();
  const literals = ['TRUE', 'FALSE', 'NULL'];
  
  for (const literal of literals) {
    const completion = completions.find(c => c.label === literal);
    if (!completion) {
      throw new Error(`Autocomplete should include ${literal} literal`);
    }
    
    if (completion.kind !== 'Constant') {
      throw new Error(`Literal ${literal} should have Constant kind`);
    }
  }
});

// Test 5: Hover information for functions
test('Hover provides function information', () => {
  const hover = mockGenerateHover('STRING');
  
  if (!hover) {
    throw new Error('Should provide hover information for STRING function');
  }
  
  if (!hover.contents || !hover.contents.value) {
    throw new Error('Hover should have contents with value');
  }
  
  const content = hover.contents.value;
  if (!content.includes('STRING') || !content.includes('→')) {
    throw new Error('Hover should include function signature and return type');
  }
});

// Test 6: Hover information for literals
test('Hover provides literal information', () => {
  const hover = mockGenerateHover('TRUE');
  
  if (!hover) {
    throw new Error('Should provide hover information for TRUE literal');
  }
  
  const content = hover.contents.value;
  if (!content.includes('TRUE') || !content.includes('literal')) {
    throw new Error('Hover should indicate TRUE is a literal');
  }
});

// Test 7: Word position detection
test('Word position detection works correctly', () => {
  const text = 'STRING(amount) + 42';
  
  // Test function name detection
  const stringPos = mockGetWordAtPosition(text, 2); // Inside 'STRING'
  if (!stringPos || stringPos.word !== 'STRING') {
    throw new Error('Should detect STRING function at position 2');
  }
  
  // Test identifier detection
  const amountPos = mockGetWordAtPosition(text, 8); // Inside 'amount'
  if (!amountPos || amountPos.word !== 'amount') {
    throw new Error('Should detect amount identifier at position 8');
  }
  
  // Test no word at operator
  const operatorPos = mockGetWordAtPosition(text, 15); // At '+'
  if (operatorPos !== null) {
    throw new Error('Should return null for operator position');
  }
});

// Test 8: Complex formula validation
test('LSP handles complex formulas correctly', () => {
  const complexFormula = 'IF(amount > 1000, STRING(amount) & " (large)", "small")';
  const diagnostics = mockValidateFormula(complexFormula);
  
  if (diagnostics.length > 0) {
    throw new Error(`Complex formula should be valid: ${diagnostics[0].message}`);
  }
});

// Test 9: Nested function validation
test('LSP validates nested functions', () => {
  const nestedFormula = 'UPPER(LEFT(merchant_rel.business_name, 10))';
  const diagnostics = mockValidateFormula(nestedFormula);
  
  if (diagnostics.length > 0) {
    throw new Error(`Nested functions should be valid: ${diagnostics[0].message}`);
  }
});

// Test 10: Error position accuracy
test('Error positions are accurate', () => {
  const formula = 'STRING(';
  const diagnostics = mockValidateFormula(formula);
  
  if (diagnostics.length === 0) {
    throw new Error('Should detect error in incomplete function call');
  }
  
  const diagnostic = diagnostics[0];
  if (!diagnostic.range || typeof diagnostic.range.start.character !== 'number') {
    throw new Error('Error should have accurate position information');
  }
});

// Test 11: Multiple error detection
test('LSP detects multiple errors in single formula', () => {
  const multiErrorFormula = 'UNKNOWN_FUNC( + ANOTHER_UNKNOWN(';
  const diagnostics = mockValidateFormula(multiErrorFormula);
  
  // Should detect at least one error (maybe more depending on parser behavior)
  if (diagnostics.length === 0) {
    throw new Error('Should detect errors in formula with multiple issues');
  }
});

// Test 12: Function metadata accessibility
test('Function metadata is properly accessible', () => {
  const functionNames = getFunctionNames();
  
  if (!Array.isArray(functionNames) || functionNames.length === 0) {
    throw new Error('Should have accessible function names');
  }
  
  // Check that metadata exists for key functions
  const keyFunctions = ['STRING', 'IF', 'TODAY'];
  for (const func of keyFunctions) {
    if (!FUNCTION_METADATA[func]) {
      throw new Error(`Should have metadata for ${func} function`);
    }
    
    const metadata = FUNCTION_METADATA[func];
    if (!metadata.description || !metadata.arguments || !metadata.returnType) {
      throw new Error(`Function ${func} should have complete metadata`);
    }
  }
});

// Test 13: Case insensitive function detection
test('Function detection is case insensitive', () => {
  const lowerHover = mockGenerateHover('string');
  const upperHover = mockGenerateHover('STRING');
  const mixedHover = mockGenerateHover('String');
  
  if (!lowerHover || !upperHover || !mixedHover) {
    throw new Error('Function detection should be case insensitive');
  }
  
  // All should provide similar information
  if (!lowerHover.contents.value.includes('STRING') ||
      !upperHover.contents.value.includes('STRING') ||
      !mixedHover.contents.value.includes('STRING')) {
    throw new Error('All case variations should provide function information');
  }
});

// Test 14: Empty text handling
test('LSP handles empty or whitespace text gracefully', () => {
  const emptyDiagnostics = mockValidateFormula('');
  const whitespaceDiagnostics = mockValidateFormula('   \n  \t  ');
  
  // Empty text should be considered an error
  if (emptyDiagnostics.length === 0) {
    throw new Error('Empty formula should be detected as error');
  }
  
  // Whitespace only should also be an error
  if (whitespaceDiagnostics.length === 0) {
    throw new Error('Whitespace-only formula should be detected as error');
  }
});

// Test 15: Special character handling
test('LSP handles special characters in formulas', () => {
  const specialFormula = '"Hello & goodbye" & STRING(42)';
  const diagnostics = mockValidateFormula(specialFormula);
  
  if (diagnostics.length > 0) {
    throw new Error(`Formula with special characters should be valid: ${diagnostics[0].message}`);
  }
});

// Run all tests
runTests();

// Report results
console.log('\n==================================================');
console.log(`Test Results: ${passedTests}/${tests.length} passed`);
if (passedTests === tests.length) {
  console.log('✅ All tests passed!');
} else {
  console.log('❌ Some tests failed!');
}

export { tests, passedTests };