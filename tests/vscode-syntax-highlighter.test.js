/**
 * VSCode Syntax Highlighter Tests
 * Tests the token definitions and TextMate grammar generation
 */

import { TOKEN_DEFINITIONS } from '../src/lexer.js';
import { generateTextMateGrammar, convertRegexPattern } from '../scripts/generate-vscode-grammar.js';

console.log('Running VSCode Syntax Highlighter Tests...');

let testCount = 0;
let passCount = 0;

function test(description, fn) {
  testCount++;
  try {
    fn();
    console.log(`✓ Test ${testCount}: ${description}`);
    passCount++;
  } catch (error) {
    console.log(`✗ Test ${testCount}: ${description}`);
    console.log(`  Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertContains(container, item, message) {
  if (!container.includes(item)) {
    throw new Error(message || `Expected ${container} to contain ${item}`);
  }
}

// Test 1-5: Token Definitions Structure
test('TOKEN_DEFINITIONS is properly exported', () => {
  assert(TOKEN_DEFINITIONS, 'TOKEN_DEFINITIONS should be exported');
  assert(typeof TOKEN_DEFINITIONS === 'object', 'TOKEN_DEFINITIONS should be an object');
});

test('All required token types are defined', () => {
  const requiredTokens = ['FUNCTIONS', 'LITERALS', 'STRING_LITERAL', 'NUMBER', 'IDENTIFIER', 
                         'COMPARISON_OPERATORS', 'ARITHMETIC_OPERATORS', 'STRING_OPERATOR',
                         'PARENTHESES', 'COMMA', 'DOT', 'LINE_COMMENT', 'BLOCK_COMMENT'];
  
  for (const tokenType of requiredTokens) {
    assert(TOKEN_DEFINITIONS[tokenType], `${tokenType} should be defined`);
  }
});

test('Each token definition has required properties', () => {
  for (const [tokenName, tokenDef] of Object.entries(TOKEN_DEFINITIONS)) {
    assert(tokenDef.pattern, `${tokenName} should have pattern property`);
    assert(tokenDef.textMateScope, `${tokenName} should have textMateScope property`);
    assert(tokenDef.description, `${tokenName} should have description property`);
    assert(tokenDef.tokenType, `${tokenName} should have tokenType property`);
  }
});

test('Function patterns include all expected functions', () => {
  const functionPattern = TOKEN_DEFINITIONS.FUNCTIONS.pattern.source;
  const expectedFunctions = ['TODAY', 'ME', 'STRING', 'IF', 'ISNULL', 'AND', 'OR', 'NOT', 
                            'ABS', 'ROUND', 'UPPER', 'LOWER', 'STRING_AGG', 'COUNT_AGG'];
  
  for (const func of expectedFunctions) {
    assertContains(functionPattern, func, `Function pattern should include ${func}`);
  }
});

test('TextMate scopes follow proper naming convention', () => {
  const scopePatterns = [
    'support.function.formula',
    'constant.language.formula',
    'string.quoted.double.formula',
    'constant.numeric.formula',
    'variable.other.formula',
    'keyword.operator.',
    'punctuation.',
    'comment.'
  ];
  
  for (const [tokenName, tokenDef] of Object.entries(TOKEN_DEFINITIONS)) {
    const scope = tokenDef.textMateScope;
    const hasValidScope = scopePatterns.some(pattern => scope.includes(pattern));
    assert(hasValidScope, `${tokenName} scope "${scope}" should follow naming convention`);
  }
});

// Test 6-10: RegEx Pattern Conversion
test('convertRegexPattern handles basic patterns', () => {
  const pattern = /\d+/;
  const result = convertRegexPattern(pattern);
  assertEqual(result, '\\d+', 'Basic digit pattern should be converted correctly');
});

test('convertRegexPattern handles word boundaries', () => {
  const pattern = /\bTODAY\b/;
  const result = convertRegexPattern(pattern);
  assertEqual(result, '\\bTODAY\\b', 'Word boundary pattern should be preserved');
});

test('convertRegexPattern handles complex function pattern', () => {
  const pattern = TOKEN_DEFINITIONS.FUNCTIONS.pattern;
  const result = convertRegexPattern(pattern);
  assertContains(result, 'TODAY', 'Function pattern should contain TODAY');
  assertContains(result, 'STRING_AGG', 'Function pattern should contain STRING_AGG');
});

test('convertRegexPattern handles operator patterns', () => {
  const pattern = TOKEN_DEFINITIONS.COMPARISON_OPERATORS.pattern;
  const result = convertRegexPattern(pattern);
  assertContains(result, '>=', 'Comparison pattern should contain >=');
  assertContains(result, '!=', 'Comparison pattern should contain !=');
});

test('convertRegexPattern handles string literal pattern', () => {
  const pattern = TOKEN_DEFINITIONS.STRING_LITERAL.pattern;
  const result = convertRegexPattern(pattern);
  assertEqual(result, '"[^"]*"', 'String literal pattern should be converted correctly');
});

// Test 11-15: TextMate Grammar Generation
test('generateTextMateGrammar returns valid grammar object', () => {
  const grammar = generateTextMateGrammar();
  
  assert(grammar, 'Grammar should be generated');
  assert(grammar.$schema, 'Grammar should have $schema');
  assert(grammar.name, 'Grammar should have name');
  assert(grammar.scopeName, 'Grammar should have scopeName');
  assert(Array.isArray(grammar.fileTypes), 'Grammar should have fileTypes array');
  assert(Array.isArray(grammar.patterns), 'Grammar should have patterns array');
});

test('Generated grammar has correct metadata', () => {
  const grammar = generateTextMateGrammar();
  
  assertEqual(grammar.name, 'Formula Language', 'Grammar name should be Formula Language');
  assertEqual(grammar.scopeName, 'source.formula', 'Scope name should be source.formula');
  assertContains(grammar.fileTypes, 'formula', 'File types should include .formula');
});

test('Generated grammar includes all token patterns', () => {
  const grammar = generateTextMateGrammar();
  const patternNames = grammar.patterns.map(p => p.name).filter(Boolean);
  
  // Check for key pattern types
  const expectedScopes = [
    'comment.line.double-slash.formula',
    'support.function.formula',
    'constant.language.formula',
    'string.quoted.double.formula',
    'constant.numeric.formula',
    'variable.other.formula'
  ];
  
  for (const scope of expectedScopes) {
    assert(patternNames.includes(scope), `Grammar should include pattern: ${scope}`);
  }
});

test('Grammar patterns are in correct priority order', () => {
  const grammar = generateTextMateGrammar();
  const patternNames = grammar.patterns.map(p => p.name).filter(Boolean);
  
  // Comments should come first (highest priority)
  assertEqual(patternNames[0], 'comment.line.double-slash.formula', 'Line comments should be first');
  
  // Functions should come before general identifiers
  const functionIndex = patternNames.indexOf('support.function.formula');
  const identifierIndex = patternNames.indexOf('variable.other.formula');
  assert(functionIndex < identifierIndex, 'Functions should come before identifiers');
});

test('Block comment pattern uses begin/end structure', () => {
  const grammar = generateTextMateGrammar();
  const blockCommentPattern = grammar.patterns.find(p => p.name === 'comment.block.formula');
  
  assert(blockCommentPattern, 'Block comment pattern should exist');
  assert(blockCommentPattern.begin, 'Block comment should have begin pattern');
  assert(blockCommentPattern.end, 'Block comment should have end pattern');
  assertEqual(blockCommentPattern.begin, '/\\*', 'Block comment begin should be /*');
  assertEqual(blockCommentPattern.end, '\\*/', 'Block comment end should be */');
});

// Test 16-20: Pattern Functionality
test('Function pattern matches case-insensitive', () => {
  const pattern = TOKEN_DEFINITIONS.FUNCTIONS.pattern;
  
  assert(pattern.test('TODAY'), 'Pattern should match TODAY');
  assert(pattern.test('today'), 'Pattern should match today (lowercase)');
  assert(pattern.test('Today'), 'Pattern should match Today (mixed case)');
  assert(pattern.test('STRING_AGG'), 'Pattern should match STRING_AGG');
  assert(pattern.test('string_agg'), 'Pattern should match string_agg (lowercase)');
});

test('Literal pattern matches boolean and null values', () => {
  const pattern = TOKEN_DEFINITIONS.LITERALS.pattern;
  
  assert(pattern.test('TRUE'), 'Pattern should match TRUE');
  assert(pattern.test('FALSE'), 'Pattern should match FALSE');
  assert(pattern.test('NULL'), 'Pattern should match NULL');
  assert(pattern.test('true'), 'Pattern should match true (lowercase)');
  assert(pattern.test('false'), 'Pattern should match false (lowercase)');
  assert(pattern.test('null'), 'Pattern should match null (lowercase)');
});

test('Number pattern matches integers and decimals', () => {
  const pattern = TOKEN_DEFINITIONS.NUMBER.pattern;
  
  assert(pattern.test('42'), 'Pattern should match integer');
  assert(pattern.test('3.14'), 'Pattern should match decimal');
  assert(pattern.test('0'), 'Pattern should match zero');
  assert(pattern.test('123.456'), 'Pattern should match multi-digit decimal');
  assert(!pattern.test('abc'), 'Pattern should not match non-numbers');
});

test('String literal pattern matches quoted strings', () => {
  const pattern = TOKEN_DEFINITIONS.STRING_LITERAL.pattern;
  
  assert(pattern.test('"hello"'), 'Pattern should match basic string');
  assert(pattern.test('"hello world"'), 'Pattern should match string with spaces');
  assert(pattern.test('""'), 'Pattern should match empty string');
  assert(pattern.test('"123"'), 'Pattern should match numeric string');
  assert(!pattern.test('hello'), 'Pattern should not match unquoted string');
  assert(!pattern.test('"unclosed'), 'Pattern should not match unclosed string');
});

test('Comparison operator pattern matches all operators', () => {
  const pattern = TOKEN_DEFINITIONS.COMPARISON_OPERATORS.pattern;
  
  assert(pattern.test('>='), 'Pattern should match >=');
  assert(pattern.test('<='), 'Pattern should match <=');
  assert(pattern.test('<>'), 'Pattern should match <>');
  assert(pattern.test('!='), 'Pattern should match !=');
  assert(pattern.test('>'), 'Pattern should match >');
  assert(pattern.test('<'), 'Pattern should match <');
  assert(pattern.test('='), 'Pattern should match =');
});

// Test 21-25: Error Cases and Edge Cases
test('Handles missing token properties gracefully', () => {
  // This test ensures our generation doesn't break with malformed token definitions
  const originalFunctions = TOKEN_DEFINITIONS.FUNCTIONS;
  
  // Temporarily modify token definition
  TOKEN_DEFINITIONS.FUNCTIONS = { pattern: /test/ };
  
  try {
    // Should not throw an error even with missing properties
    const result = convertRegexPattern(TOKEN_DEFINITIONS.FUNCTIONS.pattern);
    assertEqual(result, 'test', 'Should handle minimal token definition');
  } finally {
    // Restore original
    TOKEN_DEFINITIONS.FUNCTIONS = originalFunctions;
  }
});

test('Pattern priorities prevent conflicts', () => {
  // Test that specific patterns (like functions) take priority over general ones (like identifiers)
  const grammar = generateTextMateGrammar();
  
  // Functions should come before identifiers to prevent conflicts
  const functionPattern = grammar.patterns.find(p => p.name === 'support.function.formula');
  const identifierPattern = grammar.patterns.find(p => p.name === 'variable.other.formula');
  
  const functionIndex = grammar.patterns.indexOf(functionPattern);
  const identifierIndex = grammar.patterns.indexOf(identifierPattern);
  
  assert(functionIndex < identifierIndex, 'Functions must come before identifiers to prevent conflicts');
});

test('All aggregate functions are included', () => {
  const functionPattern = TOKEN_DEFINITIONS.FUNCTIONS.pattern.source;
  const aggregateFunctions = ['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 
                             'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'];
  
  for (const func of aggregateFunctions) {
    assertContains(functionPattern, func, `Function pattern should include aggregate function ${func}`);
  }
});

test('Grammar patterns handle edge cases', () => {
  const grammar = generateTextMateGrammar();
  
  // Ensure we have patterns for all major syntax elements
  const patternNames = grammar.patterns.map(p => p.name).filter(Boolean);
  
  // Check for comprehensive coverage
  assert(patternNames.length >= 10, 'Should have sufficient pattern coverage');
  
  // Should handle both line and block comments
  assert(patternNames.includes('comment.line.double-slash.formula'), 'Should handle line comments');
  assert(patternNames.includes('comment.block.formula'), 'Should handle block comments');
});

test('Generated grammar is valid JSON structure', () => {
  const grammar = generateTextMateGrammar();
  
  // Should be serializable to JSON
  const jsonString = JSON.stringify(grammar);
  assert(jsonString, 'Grammar should be JSON serializable');
  
  // Should be parseable back from JSON
  const parsedGrammar = JSON.parse(jsonString);
  assertEqual(parsedGrammar.name, grammar.name, 'Parsed grammar should match original');
  assertEqual(parsedGrammar.patterns.length, grammar.patterns.length, 'Pattern count should match');
});

// Print results
console.log('\n==================================================');
console.log(`Test Results: ${passCount}/${testCount} passed`);
if (passCount === testCount) {
  console.log('✅ All tests passed!');
} else {
  console.log(`❌ ${testCount - passCount} test(s) failed`);
  process.exit(1);
}
console.log(`✅ ${passCount}/${testCount} tests passed in ./vscode-syntax-highlighter.test.js`);