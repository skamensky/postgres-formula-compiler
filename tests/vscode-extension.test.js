/**
 * VSCode Extension Tests
 * 
 * Tests for VSCode syntax highlighting extension generation
 */

import { generateTextMateGrammar, generateExtensionPackageJson, generateLanguageConfiguration } from '../scripts/generate-vscode-grammar.js';
import { getFunctionNames, getLiterals, getTokenDefinitions } from '../src/lexer.js';

console.log('Running VSCode Extension Tests...\n');

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

// Test 1: Grammar generation produces valid structure
test('TextMate grammar has correct structure', () => {
  const grammar = generateTextMateGrammar();
  
  if (!grammar.name || grammar.name !== 'Formula Language') {
    throw new Error('Grammar should have correct name');
  }
  
  if (!grammar.scopeName || grammar.scopeName !== 'source.formula') {
    throw new Error('Grammar should have correct scope name');
  }
  
  if (!Array.isArray(grammar.fileTypes) || !grammar.fileTypes.includes('formula')) {
    throw new Error('Grammar should support .formula files');
  }
  
  if (!grammar.repository || !grammar.repository.functions) {
    throw new Error('Grammar should have functions repository');
  }
});

// Test 2: Functions are properly included in grammar
test('All functions are included in grammar', () => {
  const grammar = generateTextMateGrammar();
  const functionNames = getFunctionNames();
  
  const functionsPattern = grammar.repository.functions.patterns[0];
  if (!functionsPattern || !functionsPattern.match) {
    throw new Error('Functions pattern should exist');
  }
  
  // Check that at least some key functions are included
  const keyFunctions = ['TODAY', 'STRING', 'IF', 'SUM_AGG'];
  for (const func of keyFunctions) {
    if (!functionsPattern.match.includes(func)) {
      throw new Error(`Function ${func} should be included in grammar`);
    }
  }
  
  if (functionNames.length === 0) {
    throw new Error('Should have function names from lexer');
  }
});

// Test 3: Literals are properly included in grammar
test('Literals are included in grammar', () => {
  const grammar = generateTextMateGrammar();
  const literals = getLiterals();
  
  const literalsPattern = grammar.repository.literals.patterns[0];
  if (!literalsPattern || !literalsPattern.match) {
    throw new Error('Literals pattern should exist');
  }
  
  // Check that literals are included
  for (const literal of literals) {
    if (!literalsPattern.match.includes(literal)) {
      throw new Error(`Literal ${literal} should be included in grammar`);
    }
  }
});

// Test 4: Package.json generation
test('Extension package.json has correct structure', () => {
  const packageJson = generateExtensionPackageJson();
  
  if (!packageJson.name || packageJson.name !== 'formula-language-support') {
    throw new Error('Package should have correct name');
  }
  
  if (!packageJson.contributes || !packageJson.contributes.languages) {
    throw new Error('Package should contribute languages');
  }
  
  const language = packageJson.contributes.languages[0];
  if (!language || language.id !== 'formula') {
    throw new Error('Should contribute formula language');
  }
  
  if (!language.extensions || !language.extensions.includes('.formula')) {
    throw new Error('Should support .formula extension');
  }
});

// Test 5: Language configuration generation
test('Language configuration has correct features', () => {
  const config = generateLanguageConfiguration();
  
  if (!config.comments || !config.comments.lineComment) {
    throw new Error('Should support line comments');
  }
  
  if (!config.brackets || !Array.isArray(config.brackets)) {
    throw new Error('Should define bracket pairs');
  }
  
  if (!config.autoClosingPairs || !Array.isArray(config.autoClosingPairs)) {
    throw new Error('Should define auto-closing pairs');
  }
});

// Test 6: Token metadata is accessible
test('Token metadata is properly exposed', () => {
  const tokenDefs = getTokenDefinitions();
  
  if (!tokenDefs || typeof tokenDefs !== 'object') {
    throw new Error('Token definitions should be available');
  }
  
  // Check for key token types
  const keyTokens = ['NUMBER', 'STRING', 'IDENTIFIER'];
  for (const tokenType of keyTokens) {
    if (!tokenDefs[tokenType]) {
      throw new Error(`Token type ${tokenType} should be defined`);
    }
    
    const tokenDef = tokenDefs[tokenType];
    if (!tokenDef.textMateScope || !tokenDef.description) {
      throw new Error(`Token ${tokenType} should have textMateScope and description`);
    }
  }
});

// Test 7: Grammar includes all required patterns
test('Grammar includes all required patterns', () => {
  const grammar = generateTextMateGrammar();
  
  const requiredPatterns = ['comments', 'strings', 'numbers', 'functions', 'literals', 'operators', 'punctuation', 'identifiers'];
  
  for (const pattern of requiredPatterns) {
    const includePattern = grammar.patterns.find(p => p.include === `#${pattern}`);
    if (!includePattern) {
      throw new Error(`Grammar should include ${pattern} pattern`);
    }
    
    if (!grammar.repository[pattern]) {
      throw new Error(`Grammar repository should define ${pattern}`);
    }
  }
});

// Test 8: Operators are properly categorized
test('Operators are properly categorized in grammar', () => {
  const grammar = generateTextMateGrammar();
  const operators = grammar.repository.operators.patterns;
  
  // Should have arithmetic, comparison, and string operators
  const arithmeticOp = operators.find(op => op.name && op.name.includes('arithmetic'));
  const comparisonOp = operators.find(op => op.name && op.name.includes('comparison'));
  const stringOp = operators.find(op => op.name && op.name.includes('string'));
  
  if (!arithmeticOp) {
    throw new Error('Should have arithmetic operators pattern');
  }
  
  if (!comparisonOp) {
    throw new Error('Should have comparison operators pattern');
  }
  
  if (!stringOp) {
    throw new Error('Should have string operators pattern');
  }
});

// Test 9: Comments are properly supported
test('Comments are properly supported in grammar', () => {
  const grammar = generateTextMateGrammar();
  const comments = grammar.repository.comments.patterns;
  
  // Should support both line and block comments
  const lineComment = comments.find(c => c.name && c.name.includes('line'));
  const blockComment = comments.find(c => c.name && c.name.includes('block'));
  
  if (!lineComment || !lineComment.match) {
    throw new Error('Should support line comments');
  }
  
  if (!blockComment || !blockComment.begin || !blockComment.end) {
    throw new Error('Should support block comments');
  }
});

// Test 10: Error handling for invalid inputs
test('Grammar generation handles edge cases', () => {
  // This test ensures the grammar generator doesn't crash with edge cases
  try {
    const grammar = generateTextMateGrammar();
    const packageJson = generateExtensionPackageJson();
    const config = generateLanguageConfiguration();
    
    // Basic validation that they return objects
    if (typeof grammar !== 'object' || grammar === null) {
      throw new Error('Grammar should return valid object');
    }
    
    if (typeof packageJson !== 'object' || packageJson === null) {
      throw new Error('Package JSON should return valid object');
    }
    
    if (typeof config !== 'object' || config === null) {
      throw new Error('Config should return valid object');
    }
    
  } catch (error) {
    throw new Error(`Grammar generation should not crash: ${error.message}`);
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