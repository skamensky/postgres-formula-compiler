/**
 * Monaco Syntax Highlighting Integration
 * Provides syntax highlighting using Monaco's tokenization system
 */

class MonacoSyntaxHighlightingManager {
    constructor() {
        this.currentSchema = null;
        this.isReady = false;
        this.decorationIds = new Map();
        
        // Wait for Monaco to be available
        this.waitForMonaco();
    }

    async waitForMonaco() {
        // Poll for Monaco availability
        while (!window.monaco || !window.monaco.languages || !window.monaco.editor) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.isReady = true;
        this.initialize();
    }

    initialize() {
        if (!this.isReady || !window.monaco || !window.monaco.languages) return;

        // Enhanced tokenization for formula language
        this.setupEnhancedTokenization();
        
        // Enhanced theme with formula-specific colors
        this.setupEnhancedTheme();
        
        // Register diagnostic provider
        this.setupDiagnostics();
    }

    setupEnhancedTokenization() {
        // Get function names from metadata
        const functions = this.getFunctionNames();
        const keywords = ['TRUE', 'FALSE', 'NULL', 'AND', 'OR', 'NOT'];
        
        monaco.languages.setMonarchTokensProvider('formula', {
            keywords: keywords,
            functions: functions,
            
            tokenizer: {
                root: [
                    // Functions
                    [/[A-Z][A-Z0-9_]*(?=\()/, {
                        cases: {
                            '@functions': 'function',
                            '@default': 'identifier'
                        }
                    }],
                    
                    // Keywords
                    [/[A-Z][A-Z0-9_]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    
                    // Relationships (ending with _rel)
                    [/[a-zA-Z_][a-zA-Z0-9_]*_rel/, 'relationship'],
                    
                    // Column names (lowercase identifiers)
                    [/[a-z][a-zA-Z0-9_]*/, 'column'],
                    
                    // Numbers
                    [/\d+(\.\d+)?/, 'number'],
                    
                    // Strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string_double'],
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],
                    [/'/, 'string', '@string_single'],
                    
                    // Operators
                    [/[+\-*/&]/, 'operator'],
                    [/[<>=!]+/, 'operator'],
                    
                    // Delimiters
                    [/[()[\]]/, 'delimiter'],
                    [/[,;]/, 'delimiter'],
                    [/\./, 'delimiter.dot'],
                    
                    // Whitespace
                    [/\s+/, 'white'],
                    
                    // Errors
                    [/./, 'invalid']
                ],
                
                string_double: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, 'string', '@pop']
                ],
                
                string_single: [
                    [/[^\\']+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/'/, 'string', '@pop']
                ]
            }
        });
    }

    setupEnhancedTheme() {
        monaco.editor.defineTheme('formula-enhanced', {
            base: 'vs',
            inherit: true,
            rules: [
                // Functions - blue and bold
                { token: 'function', foreground: '0066cc', fontStyle: 'bold' },
                
                // Keywords - purple and bold
                { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
                
                // Numbers - green
                { token: 'number', foreground: '059669' },
                
                // Strings - red
                { token: 'string', foreground: 'dc2626' },
                { token: 'string.escape', foreground: 'dc2626', fontStyle: 'bold' },
                { token: 'string.invalid', foreground: 'dc2626', fontStyle: 'underline' },
                
                // Operators - brown and bold
                { token: 'operator', foreground: '7c2d12', fontStyle: 'bold' },
                
                // Delimiters - gray
                { token: 'delimiter', foreground: '6b7280' },
                { token: 'delimiter.dot', foreground: 'be185d', fontStyle: 'bold' },
                
                // Identifiers - dark gray
                { token: 'identifier', foreground: '374151' },
                
                // Columns - cyan
                { token: 'column', foreground: '0891b2', fontStyle: 'bold' },
                
                // Relationships - pink and italic
                { token: 'relationship', foreground: 'be185d', fontStyle: 'italic' },
                
                // Invalid tokens - red background
                { token: 'invalid', foreground: 'ffffff', background: 'dc2626' }
            ],
            colors: {
                'editor.foreground': '#374151',
                'editor.background': '#ffffff',
                'editor.selectionBackground': '#3b82f620',
                'editor.lineHighlightBackground': '#f9fafb',
                'editor.inactiveSelectionBackground': '#e5e7eb40'
            }
        });
    }

    setupDiagnostics() {
        // Set up diagnostic markers
        const diagnosticProvider = {
            provideCodeLenses: async (model) => {
                // Could provide code lenses for function documentation
                return { lenses: [], dispose: () => {} };
            }
        };

        monaco.languages.registerCodeLensProvider('formula', diagnosticProvider);
        
        // Set up hover provider
        const hoverProvider = {
            provideHover: async (model, position) => {
                try {
                    const text = model.getValue();
                    const offset = model.getOffsetAt(position);
                    
                    if (window.developerToolsClient && window.developerToolsClient.getHover) {
                        const hover = await window.developerToolsClient.getHover(text, offset);
                        if (hover && hover.contents) {
                            return {
                                contents: [{ value: hover.contents }],
                                range: hover.range ? this.offsetRangeToMonacoRange(model, hover.range) : null
                            };
                        }
                    }
                    
                    return null;
                } catch (error) {
                    console.warn('Hover provider error:', error);
                    return null;
                }
            }
        };

        monaco.languages.registerHoverProvider('formula', hoverProvider);
    }

    /**
     * Get function names from metadata
     */
    getFunctionNames() {
        if (window.developerToolsClient && window.developerToolsClient.getFunctionNames) {
            return window.developerToolsClient.getFunctionNames();
        }
        
        // Fallback to common functions
        return [
            'SUM', 'AVG', 'COUNT', 'MIN', 'MAX',
            'IF', 'AND', 'OR', 'NOT',
            'CONCAT', 'LEN', 'UPPER', 'LOWER',
            'ROUND', 'ABS', 'SQRT'
        ];
    }

    /**
     * Convert offset range to Monaco range
     */
    offsetRangeToMonacoRange(model, offsetRange) {
        const startPos = model.getPositionAt(offsetRange.start);
        const endPos = model.getPositionAt(offsetRange.end);
        
        return new monaco.Range(
            startPos.lineNumber, startPos.column,
            endPos.lineNumber, endPos.column
        );
    }

    /**
     * Attach syntax highlighting to editor wrapper (compatibility method)
     */
    attachTo(editorWrapper, tableName = null) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        
        // Apply enhanced theme
        editor.updateOptions({
            theme: 'formula-enhanced'
        });
        
        // Store table context for schema-aware highlighting
        editor._tableContext = tableName;
        
        console.log('🎨 Monaco syntax highlighting attached for table:', tableName);
        return editorWrapper;
    }

    /**
     * Detach syntax highlighting (compatibility method)
     */
    detachFrom(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            const editor = editorWrapper._monaco;
            
            // Reset to default theme
            editor.updateOptions({
                theme: 'vs'
            });
            
            delete editor._tableContext;
        }
        
        console.log('🎨 Monaco syntax highlighting detached');
    }

    /**
     * Update schema for enhanced highlighting
     */
    updateSchema(schema) {
        this.currentSchema = schema;
        
        // Could update tokenization rules based on schema
        // For now, the base rules handle most cases
    }

    /**
     * Update diagnostics for editor
     */
    async updateDiagnostics(editorWrapper, tableName = null) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const model = editor.getModel();
        
        try {
            const text = model.getValue();
            
            if (window.developerToolsClient && window.developerToolsClient.getDiagnostics) {
                const diagnostics = await window.developerToolsClient.getDiagnostics(text, tableName);
                
                // Convert diagnostics to Monaco markers
                const markers = diagnostics.map(diag => ({
                    severity: this.mapDiagnosticSeverity(diag.severity),
                    startLineNumber: model.getPositionAt(diag.range?.start || 0).lineNumber,
                    startColumn: model.getPositionAt(diag.range?.start || 0).column,
                    endLineNumber: model.getPositionAt(diag.range?.end || 0).lineNumber,
                    endColumn: model.getPositionAt(diag.range?.end || 0).column,
                    message: diag.message,
                    source: diag.source || 'formula'
                }));
                
                monaco.editor.setModelMarkers(model, 'formula', markers);
            }
        } catch (error) {
            console.warn('Diagnostics update error:', error);
        }
    }

    /**
     * Map diagnostic severity to Monaco severity
     */
    mapDiagnosticSeverity(severity) {
        const severityMap = {
            'error': monaco.MarkerSeverity.Error,
            'warning': monaco.MarkerSeverity.Warning,
            'info': monaco.MarkerSeverity.Info,
            'hint': monaco.MarkerSeverity.Hint
        };
        
        return severityMap[severity] || monaco.MarkerSeverity.Error;
    }

    /**
     * Set decorations on editor
     */
    setDecorations(editorWrapper, decorations) {
        if (!editorWrapper || !editorWrapper._monaco) return [];
        
        const editor = editorWrapper._monaco;
        const monacoDecorations = decorations.map(dec => ({
            range: dec.range,
            options: {
                className: dec.className,
                hoverMessage: dec.hoverMessage,
                inlineClassName: dec.inlineClassName,
                ...dec.options
            }
        }));
        
        const ids = editor.deltaDecorations([], monacoDecorations);
        this.decorationIds.set(editorWrapper, ids);
        
        return ids;
    }

    /**
     * Clear decorations
     */
    clearDecorations(editorWrapper) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const ids = this.decorationIds.get(editorWrapper) || [];
        
        editor.deltaDecorations(ids, []);
        this.decorationIds.delete(editorWrapper);
    }

    /**
     * Toggle syntax highlighting
     */
    toggle(editorWrapper, show = null) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const currentTheme = editor.getOptions().get(monaco.editor.EditorOption.theme);
        
        if (show === null) {
            show = currentTheme === 'vs';
        }
        
        editor.updateOptions({
            theme: show ? 'formula-enhanced' : 'vs'
        });
    }

    /**
     * Enable all syntax highlighting
     */
    enableAll() {
        // Global enable - could iterate through all editors if needed
        console.log('🎨 Syntax highlighting enabled globally');
    }

    /**
     * Disable all syntax highlighting
     */
    disableAll() {
        // Global disable - could iterate through all editors if needed
        console.log('🎨 Syntax highlighting disabled globally');
    }
}

// Global syntax highlighting instance
window.monacoSyntaxHighlighting = new MonacoSyntaxHighlightingManager();

// Maintain backward compatibility
window.syntaxHighlighting = {
    attachTo: (element, tableName) => window.monacoSyntaxHighlighting.attachTo(element, tableName),
    detachFrom: (element) => window.monacoSyntaxHighlighting.detachFrom(element),
    updateSchema: (schema) => window.monacoSyntaxHighlighting.updateSchema(schema),
    updateDiagnostics: (element, tableName) => window.monacoSyntaxHighlighting.updateDiagnostics(element, tableName),
    toggle: (element, show) => window.monacoSyntaxHighlighting.toggle(element, show),
    enableAll: () => window.monacoSyntaxHighlighting.enableAll(),
    disableAll: () => window.monacoSyntaxHighlighting.disableAll()
};

// Export for module use
export { MonacoSyntaxHighlightingManager };