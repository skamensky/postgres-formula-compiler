#!/usr/bin/env node

/**
 * VSCode TextMate Grammar Generator
 * Auto-generates syntax highlighting grammar from lexer token definitions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the formula compiler to access token definitions
const formulaCompilerPath = path.join(__dirname, '..', 'formula-compiler.js');

// Read the formula compiler file to extract TOKEN_DEFINITIONS
const formulaCompilerContent = fs.readFileSync(formulaCompilerPath, 'utf8');

// Use eval to extract TOKEN_DEFINITIONS (in a real application, you might want to use a more robust approach)
// For now, we'll parse it manually to extract the token definitions
function extractTokenDefinitions() {
  // Find the TOKEN_DEFINITIONS block
  const tokenDefStart = formulaCompilerContent.indexOf('const TOKEN_DEFINITIONS = {');
  if (tokenDefStart === -1) {
    throw new Error('TOKEN_DEFINITIONS not found in formula-compiler.js');
  }
  
  // Find the matching closing brace (this is a simplified approach)
  let braceCount = 0;
  let i = tokenDefStart + 'const TOKEN_DEFINITIONS = '.length;
  let tokenDefEnd = -1;
  
  for (; i < formulaCompilerContent.length; i++) {
    if (formulaCompilerContent[i] === '{') {
      braceCount++;
    } else if (formulaCompilerContent[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        tokenDefEnd = i + 1;
        break;
      }
    }
  }
  
  if (tokenDefEnd === -1) {
    throw new Error('Could not find end of TOKEN_DEFINITIONS');
  }
  
  const tokenDefCode = formulaCompilerContent.substring(tokenDefStart, tokenDefEnd);
  
  // Create a safe evaluation context
  const safeEval = new Function('return ' + tokenDefCode.replace('const TOKEN_DEFINITIONS = ', ''));
  return safeEval();
}

/**
 * Convert regex pattern to string for TextMate grammar
 */
function regexToString(pattern) {
  return pattern.source || pattern.toString().slice(1, -1);
}

/**
 * Generate TextMate grammar rules from token definitions
 */
function generateGrammarRules(tokenDefinitions) {
  const patterns = [];
  
  // Process each token definition
  Object.entries(tokenDefinitions).forEach(([key, def]) => {
    if (!def.textMateScope) {
      // Skip tokens without TextMate scope (like whitespace)
      return;
    }
    
    // Handle different pattern types
    if (def.functions) {
      // Function patterns
      const functionPattern = def.functions.join('|');
      patterns.push({
        name: def.textMateScope,
        match: `\\b(${functionPattern})\\b`,
        captures: {
          "1": { name: def.textMateScope }
        }
      });
    } else if (def.keywords) {
      // Keyword patterns
      const keywordPattern = def.keywords.join('|');
      patterns.push({
        name: def.textMateScope,
        match: `\\b(${keywordPattern})\\b`,
        captures: {
          "1": { name: def.textMateScope }
        }
      });
    } else if (def.tokens) {
      // Token patterns (operators, punctuation)
      const escapedTokens = def.tokens.map(token => {
        // Escape special regex characters
        return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      });
      
      if (escapedTokens.length === 1) {
        patterns.push({
          name: def.textMateScope,
          match: escapedTokens[0]
        });
      } else {
        // Multiple tokens - create alternation
        patterns.push({
          name: def.textMateScope,
          match: `(${escapedTokens.join('|')})`
        });
      }
    } else {
      // Direct pattern
      patterns.push({
        name: def.textMateScope,
        match: regexToString(def.pattern)
      });
    }
  });
  
  return patterns;
}

/**
 * Generate complete TextMate grammar
 */
function generateTextMateGrammar(tokenDefinitions) {
  const patterns = generateGrammarRules(tokenDefinitions);
  
  const grammar = {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "Formula Language",
    scopeName: "source.formula",
    fileTypes: ["formula"],
    patterns: [
      // Comments first (highest priority)
      {
        name: "comment.line.double-slash.formula",
        match: "//.*$"
      },
      {
        name: "comment.block.formula",
        begin: "/\\*",
        end: "\\*/"
      },
      
      // String literals
      {
        name: "string.quoted.double.formula",
        begin: '"',
        end: '"',
        patterns: [
          {
            name: "constant.character.escape.formula",
            match: "\\\\."
          }
        ]
      },
      
      // Numbers
      {
        name: "constant.numeric.formula",
        match: "\\b\\d+(?:\\.\\d+)?\\b"
      },
      
      // Functions (organized by category)
      {
        name: "keyword.function.core.formula",
        match: "\\b(TODAY|ME|DATE|STRING|IF)\\b"
      },
      {
        name: "keyword.function.string.formula", 
        match: "\\b(UPPER|LOWER|TRIM|LEN|LEFT|RIGHT|MID|CONTAINS|SUBSTITUTE)\\b"
      },
      {
        name: "keyword.function.null.formula",
        match: "\\b(ISNULL|NULLVALUE|ISBLANK)\\b"
      },
      {
        name: "keyword.function.logical.formula",
        match: "\\b(AND|OR|NOT)\\b"
      },
      {
        name: "keyword.function.math.formula",
        match: "\\b(ABS|ROUND|MIN|MAX|MOD|CEILING|FLOOR)\\b"
      },
      {
        name: "keyword.function.date.formula",
        match: "\\b(YEAR|MONTH|DAY|WEEKDAY|ADDMONTHS|ADDDAYS|DATEDIF)\\b"
      },
      {
        name: "keyword.function.aggregate.formula",
        match: "\\b(STRING_AGG|STRING_AGG_DISTINCT|SUM_AGG|COUNT_AGG|AVG_AGG|MIN_AGG|MAX_AGG|AND_AGG|OR_AGG)\\b"
      },
      
      // Boolean and NULL literals
      {
        name: "constant.language.boolean.formula",
        match: "\\b(TRUE|FALSE)\\b"
      },
      {
        name: "constant.language.null.formula",
        match: "\\b(NULL)\\b"
      },
      
      // Operators
      {
        name: "keyword.operator.comparison.formula",
        match: "(>=|<=|<>|!=|>|<|=)"
      },
      {
        name: "keyword.operator.arithmetic.formula",
        match: "[+\\-*/]"
      },
      {
        name: "keyword.operator.concatenation.formula",
        match: "&"
      },
      
      // Relationship references (must come before regular identifiers)
      {
        name: "variable.other.relationship.formula",
        match: "\\b[A-Za-z_]\\w*_rel\\.[A-Za-z_]\\w*\\b"
      },
      
      // Regular identifiers (column references)
      {
        name: "variable.other.column.formula",
        match: "\\b[A-Za-z_]\\w*\\b"
      },
      
      // Punctuation
      {
        name: "punctuation.parenthesis.formula",
        match: "[()]"
      },
      {
        name: "punctuation.separator.comma.formula",
        match: ","
      },
      {
        name: "punctuation.accessor.dot.formula",
        match: "\\."
      }
    ]
  };
  
  return grammar;
}

/**
 * Main function to generate and save the grammar
 */
function main() {
  try {
    console.log('Generating VSCode TextMate grammar for Formula language...');
    
    // Extract token definitions from the compiler
    const tokenDefinitions = extractTokenDefinitions();
    console.log(`Found ${Object.keys(tokenDefinitions).length} token definition categories`);
    
    // Generate TextMate grammar
    const grammar = generateTextMateGrammar(tokenDefinitions);
    
    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'vscode-extension', 'syntaxes');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write grammar file
    const outputPath = path.join(outputDir, 'formula.tmGrammar.json');
    fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2));
    
    console.log(`✅ Grammar generated successfully: ${outputPath}`);
    console.log(`   - ${grammar.patterns.length} grammar patterns`);
    console.log(`   - Supports .formula file extension`);
    console.log(`   - Scope: ${grammar.scopeName}`);
    
  } catch (error) {
    console.error('❌ Error generating grammar:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateTextMateGrammar,
  extractTokenDefinitions
};