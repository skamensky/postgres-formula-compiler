#!/usr/bin/env node

/**
 * VSCode TextMate Grammar Generator
 * Auto-generates syntax highlighting grammar from lexer token definitions
 */

import { TOKEN_DEFINITIONS } from '../src/lexer.js';
import fs from 'fs';
import path from 'path';

/**
 * Convert regex pattern to TextMate-compatible string
 * @param {RegExp} pattern - JavaScript regex pattern
 * @returns {string} - TextMate compatible regex string
 */
function convertRegexPattern(pattern) {
  // Convert JavaScript regex to TextMate format
  let regexStr = pattern.source;
  
  // Handle word boundaries
  regexStr = regexStr.replace(/\\b/g, '\\b');
  
  return regexStr;
}

/**
 * Generate TextMate grammar from token definitions
 * @returns {Object} - TextMate grammar object
 */
function generateTextMateGrammar() {
  const grammar = {
    "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    "name": "Formula Language",
    "scopeName": "source.formula",
    "fileTypes": ["formula"],
    "patterns": []
  };

  // Add patterns for each token type
  const patterns = [];

  // Comments first (highest priority)
  patterns.push({
    "name": TOKEN_DEFINITIONS.LINE_COMMENT.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.LINE_COMMENT.pattern)
  });

  patterns.push({
    "name": TOKEN_DEFINITIONS.BLOCK_COMMENT.textMateScope,
    "begin": "/\\*",
    "end": "\\*/"
  });

  // String literals
  patterns.push({
    "name": TOKEN_DEFINITIONS.STRING_LITERAL.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.STRING_LITERAL.pattern)
  });

  // Functions (must come before general identifiers)
  patterns.push({
    "name": TOKEN_DEFINITIONS.FUNCTIONS.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.FUNCTIONS.pattern)
  });

  // Boolean and null literals
  patterns.push({
    "name": TOKEN_DEFINITIONS.LITERALS.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.LITERALS.pattern)
  });

  // Numbers
  patterns.push({
    "name": TOKEN_DEFINITIONS.NUMBER.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.NUMBER.pattern)
  });

  // Comparison operators (must come before single characters)
  patterns.push({
    "name": TOKEN_DEFINITIONS.COMPARISON_OPERATORS.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.COMPARISON_OPERATORS.pattern)
  });

  // Arithmetic operators
  patterns.push({
    "name": TOKEN_DEFINITIONS.ARITHMETIC_OPERATORS.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.ARITHMETIC_OPERATORS.pattern)
  });

  // String concatenation operator
  patterns.push({
    "name": TOKEN_DEFINITIONS.STRING_OPERATOR.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.STRING_OPERATOR.pattern)
  });

  // Parentheses
  patterns.push({
    "name": TOKEN_DEFINITIONS.PARENTHESES.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.PARENTHESES.pattern)
  });

  // Comma
  patterns.push({
    "name": TOKEN_DEFINITIONS.COMMA.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.COMMA.pattern)
  });

  // Dot notation
  patterns.push({
    "name": TOKEN_DEFINITIONS.DOT.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.DOT.pattern)
  });

  // Column references and identifiers (lowest priority catch-all)
  patterns.push({
    "name": TOKEN_DEFINITIONS.IDENTIFIER.textMateScope,
    "match": convertRegexPattern(TOKEN_DEFINITIONS.IDENTIFIER.pattern)
  });

  grammar.patterns = patterns;

  return grammar;
}

/**
 * Write grammar to file
 * @param {Object} grammar - TextMate grammar object
 * @param {string} outputPath - Output file path
 */
function writeGrammarToFile(grammar, outputPath) {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write grammar file
  fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2));
  console.log(`✅ Generated TextMate grammar: ${outputPath}`);
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('🎨 Generating VSCode TextMate Grammar...');
    
    const grammar = generateTextMateGrammar();
    const outputPath = path.join(process.cwd(), 'vscode-extension', 'syntaxes', 'formula.tmGrammar.json');
    
    writeGrammarToFile(grammar, outputPath);
    
    console.log('📊 Grammar Statistics:');
    console.log(`   - Patterns: ${grammar.patterns.length}`);
    console.log(`   - Scope: ${grammar.scopeName}`);
    console.log(`   - File Types: ${grammar.fileTypes.join(', ')}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Install the VSCode extension locally');
    console.log('   2. Test syntax highlighting with .formula files');
    console.log('   3. Adjust patterns if needed');
    
  } catch (error) {
    console.error('❌ Error generating grammar:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateTextMateGrammar, convertRegexPattern };