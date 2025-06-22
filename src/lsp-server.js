#!/usr/bin/env node

/**
 * Formula Language Server Protocol (LSP) Implementation
 * 
 * Provides advanced IDE features for Formula language:
 * - Real-time error diagnostics
 * - Autocomplete for functions, columns, relationships
 * - Hover information with function signatures
 * - Go-to-definition for columns and relationships
 * - Semantic highlighting beyond basic syntax
 * - Code actions for quick fixes
 * - Workspace symbol search
 */

import {
  createConnection,
  TextDocuments,
  DiagnosticSeverity,
  ProposedFeatures,
  DidChangeConfigurationNotification,
  CompletionItemKind,
  TextDocumentSyncKind,
  MarkupKind,
  Range,
  SymbolKind,
  CodeActionKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Lexer, getFunctionNames, getLiterals } from './lexer.js';
import { Parser } from './parser.js';
import { FUNCTION_METADATA } from './function-metadata.js';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments(TextDocument);

// Server capabilities and settings
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// Database schema cache for workspace symbol search and autocomplete
const schemaCache = {
  tables: new Map(),
  relationships: new Map(),
  columns: new Map()
};

// Default settings
const defaultSettings = {
  maxNumberOfProblems: 100,
  enableSemanticHighlighting: true,
  enableAutocomplete: true,
  enableHover: true,
  enableDiagnostics: true
};

let globalSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map();

/**
 * Initialize the server
 */
connection.onInitialize((params) => {
  const capabilities = params.capabilities;

  // Check client capabilities
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Provide completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['(', ',', '.', '_']
      },
      // Provide hover information
      hoverProvider: true,
      // Provide go-to-definition
      definitionProvider: true,
      // Provide workspace symbol search
      workspaceSymbolProvider: true,
      // Provide code actions
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix]
      }
    }
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true
      }
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

/**
 * Configuration change handling
 */
connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = change.settings.formulaLanguageServer || defaultSettings;
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource) {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'formulaLanguageServer'
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});

/**
 * Real-time diagnostics - compile formulas and show errors
 */
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument) {
  const settings = await getDocumentSettings(textDocument.uri);
  
  if (!settings.enableDiagnostics) {
    return;
  }

  const text = textDocument.getText();
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
      const diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: textDocument.positionAt(compileError.position || 0),
          end: textDocument.positionAt((compileError.position || 0) + 1)
        },
        message: compileError.message || 'Compilation error',
        source: 'Formula Language Server'
      };

      if (hasDiagnosticRelatedInformationCapability) {
        diagnostic.relatedInformation = [
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({}, diagnostic.range)
            },
            message: 'Formula compilation failed'
          }
        ];
      }
      
      diagnostics.push(diagnostic);
    }
    
  } catch (parseError) {
    // Add parse error as diagnostic
    const diagnostic = {
      severity: DiagnosticSeverity.Error,
      range: {
        start: textDocument.positionAt(parseError.position || 0),
        end: textDocument.positionAt((parseError.position || 0) + 1)
      },
      message: parseError.message || 'Parse error',
      source: 'Formula Language Server'
    };
    
    diagnostics.push(diagnostic);
  }

  // Send the computed diagnostics to VS Code
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

/**
 * Autocomplete - provide completions for functions, columns, relationships
 */
connection.onCompletion(textDocumentPosition => {
  const completions = [];
  
  // Add function completions
  const functionNames = getFunctionNames();
  for (const funcName of functionNames) {
    const metadata = FUNCTION_METADATA[funcName];
    if (metadata) {
      const completion = {
        label: funcName,
        kind: CompletionItemKind.Function,
        detail: metadata.description,
        documentation: {
          kind: MarkupKind.Markdown,
          value: `**${funcName}**(${metadata.arguments.map(arg => 
            `${arg.name}: ${arg.type}`).join(', ')}) → ${metadata.returnType}\n\n${metadata.description}`
        },
        insertText: `${funcName}($1)`,
        insertTextFormat: 2 // Snippet format
      };
      completions.push(completion);
    }
  }
  
  // Add literal completions
  const literals = getLiterals();
  for (const literal of literals) {
    completions.push({
      label: literal,
      kind: CompletionItemKind.Constant,
      detail: `${literal} literal`,
      documentation: `Boolean or null literal: ${literal}`
    });
  }
  
  // Add column/relationship completions from schema cache
  for (const [tableName, table] of schemaCache.tables) {
    for (const column of table.columns) {
      completions.push({
        label: column.name,
        kind: CompletionItemKind.Field,
        detail: `Column: ${column.type}`,
        documentation: `Column ${column.name} from table ${tableName}`,
        sortText: `1_${column.name}` // Sort columns first
      });
    }
  }
  
  // Add relationship completions
  for (const [relName, relationship] of schemaCache.relationships) {
    completions.push({
      label: `${relName}_rel`,
      kind: CompletionItemKind.Reference,
      detail: `Relationship to ${relationship.targetTable}`,
      documentation: `Relationship ${relName} → ${relationship.targetTable}`,
      sortText: `2_${relName}_rel` // Sort relationships after columns
    });
  }

  return completions;
});

/**
 * Completion resolve - provide additional information for completion items
 */
connection.onCompletionResolve(item => {
  // Add more detailed documentation or examples here if needed
  return item;
});

/**
 * Hover information - show function signatures and descriptions
 */
connection.onHover(params => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const text = document.getText();
  const offset = document.offsetAt(params.position);
  
  // Find the word at the cursor position
  const wordMatch = getWordAtPosition(text, offset);
  if (!wordMatch) {
    return null;
  }

  const word = wordMatch.word.toUpperCase();
  
  // Check if it's a function
  const metadata = FUNCTION_METADATA[word];
  if (metadata) {
    const signatureText = `**${word}**(${metadata.arguments.map(arg => 
      `${arg.name}: ${arg.type}`).join(', ')}) → ${metadata.returnType}`;
    
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `${signatureText}\n\n${metadata.description}\n\n**Category:** ${metadata.category}`
      },
      range: {
        start: document.positionAt(wordMatch.start),
        end: document.positionAt(wordMatch.end)
      }
    };
  }
  
  // Check if it's a literal
  const literals = getLiterals();
  if (literals.includes(word)) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${word}** - Boolean/null literal`
      }
    };
  }
  
  return null;
});

/**
 * Go-to-definition - navigate to column/relationship definitions
 */
connection.onDefinition(params => {
  // This would require database schema integration to find where
  // columns and relationships are defined. For now, return empty.
  return [];
});

/**
 * Workspace symbol search - find columns and relationships across schema
 */
connection.onWorkspaceSymbol(params => {
  const symbols = [];
  const query = params.query.toLowerCase();
  
  // Search functions
  const functionNames = getFunctionNames();
  for (const funcName of functionNames) {
    if (funcName.toLowerCase().includes(query)) {
      symbols.push({
        name: funcName,
        kind: SymbolKind.Function,
        location: {
          uri: 'formula://builtin-functions',
          range: Range.create(0, 0, 0, 0)
        },
        containerName: 'Built-in Functions'
      });
    }
  }
  
  // Search schema columns and relationships
  for (const [tableName, table] of schemaCache.tables) {
    for (const column of table.columns) {
      if (column.name.toLowerCase().includes(query)) {
        symbols.push({
          name: column.name,
          kind: SymbolKind.Field,
          location: {
            uri: `formula://table/${tableName}`,
            range: Range.create(0, 0, 0, 0)
          },
          containerName: `Table: ${tableName}`
        });
      }
    }
  }
  
  return symbols;
});

/**
 * Code actions - provide quick fixes for common errors
 */
connection.onCodeAction(params => {
  const actions = [];
  
  // Analyze diagnostics and provide fixes
  for (const diagnostic of params.context.diagnostics) {
    if (diagnostic.message.includes('Unknown function')) {
      // Suggest similar function names
      const functionNames = getFunctionNames();
      const suggestions = functionNames.filter(name => 
        name.toLowerCase().includes('string') // Example suggestion logic
      );
      
      for (const suggestion of suggestions.slice(0, 3)) {
        actions.push({
          title: `Did you mean '${suggestion}'?`,
          kind: CodeActionKind.QuickFix,
          edit: {
            changes: {
              [params.textDocument.uri]: [{
                range: diagnostic.range,
                newText: suggestion
              }]
            }
          }
        });
      }
    }
  }
  
  return actions;
});

/**
 * Utility function to get word at position
 */
function getWordAtPosition(text, offset) {
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

/**
 * Initialize database schema cache (would connect to actual database)
 */
async function initializeSchemaCache(databaseUrl) {
  // This would connect to the actual database and load schema information
  // For now, we'll use a mock schema
  
  schemaCache.tables.set('submission', {
    columns: [
      { name: 'id', type: 'number' },
      { name: 'amount', type: 'number' },
      { name: 'status', type: 'string' },
      { name: 'created_at', type: 'date' },
      { name: 'updated_at', type: 'date' },
      { name: 'merchant', type: 'number' }
    ]
  });
  
  schemaCache.tables.set('merchant', {
    columns: [
      { name: 'id', type: 'number' },
      { name: 'business_name', type: 'string' },
      { name: 'first_name', type: 'string' },
      { name: 'last_name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'phone', type: 'string' }
    ]
  });
  
  schemaCache.relationships.set('merchant', {
    targetTable: 'merchant',
    foreignKey: 'merchant',
    targetKey: 'id'
  });
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

// Initialize schema cache on startup
initializeSchemaCache().catch(err => {
  connection.console.error(`Failed to initialize schema cache: ${err.message}`);
});

export { connection, documents, schemaCache };