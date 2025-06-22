#!/usr/bin/env node

/**
 * VSCode TextMate Grammar Generator
 * 
 * Auto-generates VSCode TextMate grammar from lexer tokens to provide
 * syntax highlighting for .formula files.
 * 
 * Features:
 * - Colorizes functions, strings, numbers, operators, keywords
 * - Basic bracket matching and indentation
 * - No semantic analysis or error checking (basic highlighting only)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTokenDefinitions, getFunctionNames, getLiterals } from '../src/lexer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate TextMate grammar JSON for Formula language
 * @returns {Object} TextMate grammar object
 */
function generateTextMateGrammar() {
  const tokenDefs = getTokenDefinitions();
  const functionNames = getFunctionNames();
  const literals = getLiterals();

  const grammar = {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "Formula Language",
    scopeName: "source.formula",
    fileTypes: ["formula"],
    patterns: [
      {
        include: "#comments"
      },
      {
        include: "#strings"
      },
      {
        include: "#numbers"
      },
      {
        include: "#functions"
      },
      {
        include: "#literals"
      },
      {
        include: "#operators"
      },
      {
        include: "#punctuation"
      },
      {
        include: "#identifiers"
      }
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: "comment.line.double-slash.formula",
            match: "//.*$"
          },
          {
            name: "comment.block.formula",
            begin: "/\\*",
            end: "\\*/",
            beginCaptures: {
              0: { name: "punctuation.definition.comment.begin.formula" }
            },
            endCaptures: {
              0: { name: "punctuation.definition.comment.end.formula" }
            }
          }
        ]
      },
      strings: {
        patterns: [
          {
            name: "string.quoted.double.formula",
            begin: "\"",
            end: "\"",
            beginCaptures: {
              0: { name: "punctuation.definition.string.begin.formula" }
            },
            endCaptures: {
              0: { name: "punctuation.definition.string.end.formula" }
            },
            patterns: [
              {
                name: "constant.character.escape.formula",
                match: "\\\\."
              }
            ]
          }
        ]
      },
      numbers: {
        patterns: [
          {
            name: "constant.numeric.formula",
            match: "\\b\\d+(\\.\\d+)?\\b"
          }
        ]
      },
      functions: {
        patterns: [
          {
            name: "keyword.function.formula",
            match: `\\b(${functionNames.join('|')})\\b`,
            captures: {
              1: { name: "entity.name.function.formula" }
            }
          }
        ]
      },
      literals: {
        patterns: [
          {
            name: "constant.language.boolean.formula",
            match: `\\b(${literals.join('|')})\\b`
          }
        ]
      },
      operators: {
        patterns: [
          {
            name: "keyword.operator.arithmetic.formula",
            match: "[+\\-*/]"
          },
          {
            name: "keyword.operator.comparison.formula", 
            match: "(>=|<=|!=|<>|>|<|=)"
          },
          {
            name: "keyword.operator.string.formula",
            match: "&"
          }
        ]
      },
      punctuation: {
        patterns: [
          {
            name: "punctuation.definition.parameters.begin.formula",
            match: "\\("
          },
          {
            name: "punctuation.definition.parameters.end.formula",
            match: "\\)"
          },
          {
            name: "punctuation.separator.parameters.formula",
            match: ","
          },
          {
            name: "punctuation.accessor.formula",
            match: "\\."
          }
        ]
      },
      identifiers: {
        patterns: [
          {
            name: "variable.other.formula",
            match: "\\b[a-zA-Z_]\\w*\\b"
          }
        ]
      }
    }
  };

  return grammar;
}

/**
 * Generate VSCode extension package.json
 * @returns {Object} Package.json for VSCode extension
 */
function generateExtensionPackageJson() {
  return {
    name: "formula-language-support",
    displayName: "Formula Language Support", 
    description: "Syntax highlighting for Formula language files",
    version: "1.0.0",
    engines: {
      vscode: "^1.74.0"
    },
    categories: ["Programming Languages"],
    main: "./out/extension.js",
    contributes: {
      languages: [
        {
          id: "formula",
          aliases: ["Formula", "formula"],
          extensions: [".formula"],
          configuration: "./language-configuration.json"
        }
      ],
      grammars: [
        {
          language: "formula",
          scopeName: "source.formula",
          path: "./syntaxes/formula.tmGrammar.json"
        }
      ]
    },
    scripts: {
      "vscode:prepublish": "npm run compile",
      compile: "tsc -p ./"
    },
    devDependencies: {
      "@types/vscode": "^1.74.0",
      typescript: "^4.9.4"
    }
  };
}

/**
 * Generate language configuration for VSCode
 * @returns {Object} Language configuration
 */
function generateLanguageConfiguration() {
  return {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"]
    },
    brackets: [
      ["(", ")"]
    ],
    autoClosingPairs: [
      ["(", ")"],
      ["\"", "\""]
    ],
    surroundingPairs: [
      ["(", ")"],
      ["\"", "\""]
    ],
    indentationRules: {
      increaseIndentPattern: "\\(",
      decreaseIndentPattern: "\\)"
    }
  };
}

/**
 * Write file only if content has changed (avoids unnecessary file modifications)
 * @param {string} filePath - Path to write to  
 * @param {string} content - Content to write
 * @returns {boolean} True if file was written
 */
function writeFileIfChanged(filePath, content) {
  let existingContent = '';
  try {
    existingContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    // File doesn't exist, will write
  }

  if (existingContent !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

/**
 * Main function to generate VSCode extension
 */
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const vscodeExtensionDir = path.join(rootDir, 'vscode-extension');
  const syntaxesDir = path.join(vscodeExtensionDir, 'syntaxes');

  // Create directories
  fs.mkdirSync(vscodeExtensionDir, { recursive: true });
  fs.mkdirSync(syntaxesDir, { recursive: true });

  console.log('🎨 Generating VSCode Formula Language Extension...\n');

  // Generate TextMate grammar
  const grammar = generateTextMateGrammar();
  const grammarPath = path.join(syntaxesDir, 'formula.tmGrammar.json');
  const grammarContent = JSON.stringify(grammar, null, 2);
  
  if (writeFileIfChanged(grammarPath, grammarContent)) {
    console.log('✅ Generated TextMate grammar: syntaxes/formula.tmGrammar.json');
  } else {
    console.log('⚡ TextMate grammar unchanged: syntaxes/formula.tmGrammar.json');
  }

  // Generate package.json for extension
  const packageJson = generateExtensionPackageJson();
  const packageJsonPath = path.join(vscodeExtensionDir, 'package.json');
  const packageJsonContent = JSON.stringify(packageJson, null, 2); 
  
  if (writeFileIfChanged(packageJsonPath, packageJsonContent)) {
    console.log('✅ Generated extension package.json');
  } else {
    console.log('⚡ Extension package.json unchanged');
  }

  // Generate language configuration
  const langConfig = generateLanguageConfiguration();
  const langConfigPath = path.join(vscodeExtensionDir, 'language-configuration.json');
  const langConfigContent = JSON.stringify(langConfig, null, 2);
  
  if (writeFileIfChanged(langConfigPath, langConfigContent)) {
    console.log('✅ Generated language configuration');
  } else {
    console.log('⚡ Language configuration unchanged');
  }

  // Generate basic README for the extension
  const readmeContent = `# Formula Language Support

VSCode syntax highlighting extension for Formula language files (.formula).

## Features

- Syntax highlighting for Formula language
- Function name highlighting
- String, number, and operator highlighting  
- Comment support (// and /* */)
- Basic bracket matching and auto-closing
- Indentation support

## Installation

1. Copy the \`vscode-extension\` folder to your local VSCode extensions directory
2. Reload VSCode
3. Open any \`.formula\` file to see syntax highlighting

## Supported File Extensions

- \`.formula\`

## Grammar Features

- **Functions**: All built-in functions (TODAY, STRING, IF, etc.)
- **Literals**: Numbers, strings, booleans (TRUE/FALSE/NULL)
- **Operators**: Arithmetic (+, -, *, /), comparison (>, <, =, etc.), concatenation (&)
- **Comments**: Line comments (//) and block comments (/* */)
- **Punctuation**: Parentheses, commas, dots for relationship access

## Generated Files

This extension is auto-generated from the Formula compiler's lexer metadata.
To regenerate, run:

\`\`\`bash
npm run generate-vscode-extension
\`\`\`
`;

  const readmePath = path.join(vscodeExtensionDir, 'README.md');
  if (writeFileIfChanged(readmePath, readmeContent)) {
    console.log('✅ Generated extension README.md');
  } else {
    console.log('⚡ Extension README.md unchanged');
  }

  console.log('\n🎉 VSCode Extension Generation Complete!');
  console.log(`📁 Extension files created in: ${path.relative(rootDir, vscodeExtensionDir)}`);
  console.log('\n📝 To install the extension locally:');
  console.log('   1. Copy the vscode-extension folder to your VSCode extensions directory');
  console.log('   2. Reload VSCode');
  console.log('   3. Open any .formula file to see syntax highlighting');
  
  // Display some statistics
  const tokenDefs = getTokenDefinitions();
  const functionNames = getFunctionNames();
  const literals = getLiterals();
  
  console.log('\n📊 Grammar Statistics:');
  console.log(`   • Token types: ${Object.keys(tokenDefs).length}`);
  console.log(`   • Built-in functions: ${functionNames.length}`);
  console.log(`   • Literals: ${literals.length}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateTextMateGrammar, generateExtensionPackageJson, generateLanguageConfiguration };