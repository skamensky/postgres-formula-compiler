/**
 * Enhanced Monaco Editor Integration with LSP and Syntax Highlighting
 * Provides VS Code-like autocomplete, syntax highlighting, and diagnostics
 */

console.log('🚀 Loading Enhanced Monaco Integration...');

// Import our language services
import { FormulaLanguageServer } from './lsp.js';
import { FormulaSyntaxHighlighter } from './syntax-highlighter.js';

// Global instances
let languageServer = null;
let syntaxHighlighter = null;
let currentSchema = null;

/**
 * Enhanced Monaco Editor Integration
 */
export class EnhancedMonacoIntegration {
    constructor() {
        this.editors = new Map();
        this.languageId = 'formula';
        this.isInitialized = false;
    }

    /**
     * Initialize Monaco with enhanced language support
     */
    async initialize() {
        if (this.isInitialized) return;

        console.log('🔧 Initializing Enhanced Monaco Integration...');

        try {
            // Configure Monaco CDN path
            require.config({ 
                paths: { 
                    'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' 
                } 
            });
            
            // Load Monaco
            await new Promise((resolve, reject) => {
                require(['vs/editor/editor.main'], function() {
                    console.log('✅ Monaco loaded for enhanced integration');
                    resolve();
                }, function(error) {
                    console.error('❌ Monaco loading failed:', error);
                    reject(error);
                });
            });

            // Initialize language services
            languageServer = new FormulaLanguageServer();
            syntaxHighlighter = new FormulaSyntaxHighlighter();

            // Register the language
            await this.registerLanguage();

            this.isInitialized = true;
            console.log('✅ Enhanced Monaco Integration initialized');

        } catch (error) {
            console.error('❌ Enhanced Monaco integration failed:', error);
            throw error;
        }
    }

    /**
     * Register formula language with Monaco
     */
    async registerLanguage() {
        console.log('📝 Registering formula language...');

        // Register language
        monaco.languages.register({ id: this.languageId });

        // Set language configuration
        const langConfig = syntaxHighlighter.getMonacoLanguageConfig();
        monaco.languages.setLanguageConfiguration(this.languageId, langConfig);

        // Set tokenizer
        const tokenizer = syntaxHighlighter.getMonacoTokenizer();
        monaco.languages.setMonarchTokensProvider(this.languageId, tokenizer);

        // Define custom theme
        const theme = syntaxHighlighter.getMonacoTheme();
        monaco.editor.defineTheme('formulaTheme', theme);

        // Register completion provider
        monaco.languages.registerCompletionItemProvider(this.languageId, {
            triggerCharacters: ['.', '(', ',', ' '],
            provideCompletionItems: (model, position) => {
                return this.provideCompletions(model, position);
            }
        });

        // Register hover provider
        monaco.languages.registerHoverProvider(this.languageId, {
            provideHover: (model, position) => {
                return this.provideHover(model, position);
            }
        });

        // Register diagnostic provider (validation)
        this.registerDiagnosticProvider();

        console.log('✅ Formula language registered with Monaco');
    }

    /**
     * Create enhanced editor
     */
    createEditor(containerId, initialValue = '') {
        console.log(`🔧 Creating enhanced editor for ${containerId}...`);

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container ${containerId} not found`);
            return null;
        }

        // Clear container
        container.innerHTML = '';

        // Create Monaco editor
        const editor = monaco.editor.create(container, {
            value: initialValue,
            language: this.languageId,
            theme: 'formulaTheme',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            contextmenu: true,
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            parameterHints: {
                enabled: true
            },
            // Advanced features
            bracketMatching: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoSurround: 'quotes',
            formatOnPaste: true,
            formatOnType: true
        });

        // Create compatibility wrapper
        const editorWrapper = this.createEditorWrapper(editor);

        // Store editor reference
        this.editors.set(containerId, {
            editor,
            wrapper: editorWrapper,
            tableName: null
        });

        // Set up change listener for diagnostics
        editor.onDidChangeModelContent(() => {
            this.updateDiagnostics(editor);
        });

        console.log(`✅ Enhanced editor created for ${containerId}`);
        return editorWrapper;
    }

    /**
     * Create backward-compatible editor wrapper
     */
    createEditorWrapper(editor) {
        return {
            _monaco: editor,
            
            get value() {
                return editor.getValue();
            },
            
            set value(val) {
                editor.setValue(val || '');
            },
            
            clear() {
                editor.setValue('');
            },
            
            focus() {
                editor.focus();
            },
            
            addEventListener(event, handler) {
                if (event === 'input') {
                    editor.onDidChangeModelContent(() => {
                        handler({ target: this, type: 'input' });
                    });
                } else if (event === 'keydown') {
                    editor.onKeyDown((e) => {
                        const keyEvent = {
                            target: this,
                            type: 'keydown',
                            key: e.code,
                            ctrlKey: e.ctrlKey,
                            shiftKey: e.shiftKey,
                            altKey: e.altKey,
                            preventDefault: () => e.preventDefault()
                        };
                        handler(keyEvent);
                    });
                } else if (event === 'focus') {
                    editor.onDidFocusEditorText(() => {
                        handler({ target: this, type: 'focus' });
                    });
                } else if (event === 'blur') {
                    editor.onDidBlurEditorText(() => {
                        handler({ target: this, type: 'blur' });
                    });
                }
            },
            
            // Placeholder methods for compatibility
            removeEventListener() {},
            setSelectionRange() {},
            get selectionStart() { return 0; },
            get selectionEnd() { return this.value.length; },
            
            // Enhanced methods
            setTableContext(tableName) {
                const editorInfo = Array.from(this._monaco.getModel().editors || [])
                    .find(info => info.editor === this._monaco);
                if (editorInfo) {
                    editorInfo.tableName = tableName;
                }
            },
            
            updateSchema(schema) {
                currentSchema = schema;
                if (languageServer) {
                    languageServer.updateSchema(schema);
                }
                if (syntaxHighlighter) {
                    syntaxHighlighter.updateSchema(schema);
                }
            }
        };
    }

    /**
     * Provide completions for Monaco
     */
    async provideCompletions(model, position) {
        try {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            const offset = textUntilPosition.length;
            const fullText = model.getValue();
            
            // Get table context
            const tableName = this.getTableContext(model);
            
            // Get completions from LSP
            const completions = await languageServer.getCompletions(
                fullText, 
                offset, 
                tableName, 
                true // Use Monaco format
            );

            // Convert to Monaco format
            const suggestions = completions.map(completion => {
                // Calculate range for replacement
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                return {
                    ...completion,
                    range: range,
                    insertTextRules: completion.insertTextRules || monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                };
            });

            return {
                suggestions: suggestions
            };

        } catch (error) {
            console.error('Completion provider error:', error);
            return { suggestions: [] };
        }
    }

    /**
     * Provide hover information
     */
    async provideHover(model, position) {
        try {
            const offset = model.getOffsetAt(position);
            const fullText = model.getValue();
            
            const hover = await languageServer.getHover(fullText, offset);
            
            if (hover) {
                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        hover.range.start + 1,
                        position.lineNumber,
                        hover.range.end + 1
                    ),
                    contents: [
                        { value: hover.contents }
                    ]
                };
            }
            
            return null;
        } catch (error) {
            console.error('Hover provider error:', error);
            return null;
        }
    }

    /**
     * Register diagnostic provider for error checking
     */
    registerDiagnosticProvider() {
        // Monaco doesn't have a built-in diagnostic provider registration
        // We'll update diagnostics manually on content changes
        console.log('📋 Diagnostic provider ready');
    }

    /**
     * Update diagnostics for editor
     */
    updateDiagnostics(editor) {
        try {
            const model = editor.getModel();
            const text = model.getValue();
            const tableName = this.getTableContext(model);
            
            // Get diagnostics from LSP
            const diagnostics = languageServer.getDiagnostics(text, tableName);
            
            // Convert to Monaco markers
            const markers = diagnostics.map(diagnostic => ({
                severity: this.mapSeverity(diagnostic.severity),
                startLineNumber: model.getPositionAt(diagnostic.range.start).lineNumber,
                startColumn: model.getPositionAt(diagnostic.range.start).column,
                endLineNumber: model.getPositionAt(diagnostic.range.end).lineNumber,
                endColumn: model.getPositionAt(diagnostic.range.end).column,
                message: diagnostic.message,
                source: diagnostic.source || 'formula'
            }));
            
            // Set markers
            monaco.editor.setModelMarkers(model, 'formula', markers);
            
        } catch (error) {
            console.error('Diagnostic update error:', error);
        }
    }

    /**
     * Map LSP diagnostic severity to Monaco severity
     */
    mapSeverity(lspSeverity) {
        switch (lspSeverity) {
            case 'error': return monaco.MarkerSeverity.Error;
            case 'warning': return monaco.MarkerSeverity.Warning;
            case 'info': return monaco.MarkerSeverity.Info;
            case 'hint': return monaco.MarkerSeverity.Hint;
            default: return monaco.MarkerSeverity.Error;
        }
    }

    /**
     * Get table context for editor
     */
    getTableContext(model) {
        // Try to find editor info with table context
        for (const [containerId, editorInfo] of this.editors) {
            if (editorInfo.editor.getModel() === model) {
                return editorInfo.tableName;
            }
        }
        
        // Fallback to global context
        const tableSelect = document.getElementById('tableSelect');
        return tableSelect ? tableSelect.value : null;
    }

    /**
     * Update schema for all editors
     */
    updateSchema(schema) {
        currentSchema = schema;
        if (languageServer) {
            languageServer.updateSchema(schema);
        }
        if (syntaxHighlighter) {
            syntaxHighlighter.updateSchema(schema);
        }
        
        // Update diagnostics for all editors
        for (const editorInfo of this.editors.values()) {
            this.updateDiagnostics(editorInfo.editor);
        }
    }

    /**
     * Set table context for specific editor
     */
    setTableContext(containerId, tableName) {
        const editorInfo = this.editors.get(containerId);
        if (editorInfo) {
            editorInfo.tableName = tableName;
            this.updateDiagnostics(editorInfo.editor);
        }
    }
}

// Create global instance
const enhancedMonaco = new EnhancedMonacoIntegration();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await enhancedMonaco.initialize();
            window.enhancedMonaco = enhancedMonaco;
            console.log('🎉 Enhanced Monaco Integration ready!');
        } catch (error) {
            console.error('❌ Failed to initialize enhanced Monaco:', error);
        }
    });
} else {
    enhancedMonaco.initialize().then(() => {
        window.enhancedMonaco = enhancedMonaco;
        console.log('🎉 Enhanced Monaco Integration ready!');
    }).catch(error => {
        console.error('❌ Failed to initialize enhanced Monaco:', error);
    });
}

export default enhancedMonaco;