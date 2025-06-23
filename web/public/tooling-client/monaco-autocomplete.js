/**
 * Monaco Autocomplete Integration
 * Provides intelligent code completion using Monaco's completion system
 */

class MonacoAutocompleteManager {
    constructor() {
        this.currentSchema = null;
        this.providers = [];
        this.isReady = false;
        
        // Wait for Monaco to be available
        this.waitForMonaco();
    }

    async waitForMonaco() {
        // Poll for Monaco availability
        while (!window.monaco || !window.monaco.languages || !window.monaco.languages.registerCompletionItemProvider) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.isReady = true;
        this.initialize();
    }

    initialize() {
        if (!this.isReady || !window.monaco || !window.monaco.languages) return;

        // Register completion provider for formula language
        const provider = {
            triggerCharacters: ['.', '(', ',', ' '],
            
            provideCompletionItems: async (model, position) => {
                try {
                    const text = model.getValue();
                    const offset = model.getOffsetAt(position);
                    
                    // Get context from developer tools
                    const tableName = this.getCurrentTableName();
                    const completions = await this.getCompletions(text, offset, tableName);
                    
                    return {
                        suggestions: completions.map(comp => this.mapToMonacoCompletion(comp))
                    };
                } catch (error) {
                    console.warn('Monaco autocomplete error:', error);
                    return { suggestions: [] };
                }
            }
        };

        const disposable = monaco.languages.registerCompletionItemProvider('formula', provider);
        this.providers.push(disposable);
    }

    /**
     * Get completions from developer tools client
     */
    async getCompletions(text, position, tableName) {
        if (window.developerToolsClient && window.developerToolsClient.getCompletions) {
            return await window.developerToolsClient.getCompletions(text, position, tableName);
        }
        return [];
    }

    /**
     * Get current table name from UI
     */
    getCurrentTableName() {
        const tableSelect = document.getElementById('tableSelect');
        return tableSelect ? tableSelect.value : null;
    }

    /**
     * Map completion item to Monaco format
     */
    mapToMonacoCompletion(completion) {
        const kind = this.mapCompletionKind(completion.kind);
        
        return {
            label: completion.label,
            kind: kind,
            detail: completion.detail,
            documentation: completion.documentation,
            insertText: completion.insertText || completion.label,
            sortText: completion.sortText || completion.label,
            filterText: completion.label,
            range: this.getInsertRange(completion)
        };
    }

    /**
     * Map completion kind to Monaco CompletionItemKind
     */
    mapCompletionKind(kind) {
        const kindMap = {
            'function': monaco.languages.CompletionItemKind.Function,
            'keyword': monaco.languages.CompletionItemKind.Keyword,
            'field': monaco.languages.CompletionItemKind.Field,
            'relationship': monaco.languages.CompletionItemKind.Reference,
            'literal': monaco.languages.CompletionItemKind.Value,
            'operator': monaco.languages.CompletionItemKind.Operator
        };
        
        return kindMap[kind] || monaco.languages.CompletionItemKind.Text;
    }

    /**
     * Get insert range for completion
     */
    getInsertRange(completion) {
        // Return null to use default word range
        return null;
    }

    /**
     * Update schema for enhanced completions
     */
    updateSchema(schema) {
        this.currentSchema = schema;
    }

    /**
     * Attach autocomplete to Monaco editor wrapper (compatibility method)
     */
    attachTo(editorWrapper, tableName = null) {
        // Monaco handles completion automatically through the provider
        // This is for backward compatibility with the old interface
        
        if (editorWrapper && editorWrapper._monaco) {
            const editor = editorWrapper._monaco;
            
            // Store table context on the editor for completion provider
            editor._tableContext = tableName;
            
            // Configure completion behavior
            editor.updateOptions({
                quickSuggestions: {
                    "other": true,
                    "comments": false,
                    "strings": false
                },
                quickSuggestionsDelay: 100,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                acceptSuggestionOnCommitCharacter: true,
                tabCompletion: "on"
            });
        }
        
        console.log('🔧 Monaco autocomplete attached for table:', tableName);
    }

    /**
     * Detach autocomplete (compatibility method)
     */
    detachFrom(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            delete editorWrapper._monaco._tableContext;
        }
        console.log('🔧 Monaco autocomplete detached');
    }

    /**
     * Show completions manually (compatibility method)
     */
    async showCompletions(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            const editor = editorWrapper._monaco;
            editor.trigger('keyboard', 'editor.action.triggerSuggest');
        }
    }

    /**
     * Hide completions (compatibility method)
     */
    hideCompletions(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            const editor = editorWrapper._monaco;
            editor.trigger('keyboard', 'closeSuggestionWidget');
        }
    }

    /**
     * Check if completions are visible
     */
    isVisible(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            const editor = editorWrapper._monaco;
            const suggestWidget = editor.getContribution('editor.contrib.suggestController');
            return suggestWidget && suggestWidget.widget && suggestWidget.widget.isVisible();
        }
        return false;
    }

    /**
     * Get current table name from editor context
     */
    getTableContext(editorWrapper) {
        if (editorWrapper && editorWrapper._monaco) {
            return editorWrapper._monaco._tableContext || this.getCurrentTableName();
        }
        return this.getCurrentTableName();
    }

    /**
     * Register custom completion provider
     */
    registerProvider(provider) {
        if (!this.isReady || !window.monaco) return null;
        
        const disposable = monaco.languages.registerCompletionItemProvider('formula', provider);
        this.providers.push(disposable);
        return disposable;
    }

    /**
     * Dispose all providers
     */
    dispose() {
        this.providers.forEach(provider => provider.dispose());
        this.providers = [];
    }
}

// Global autocomplete instance
window.monacoAutocomplete = new MonacoAutocompleteManager();

// Maintain backward compatibility
window.autocomplete = {
    attachTo: (element, tableName) => window.monacoAutocomplete.attachTo(element, tableName),
    detachFrom: (element) => window.monacoAutocomplete.detachFrom(element),
    updateSchema: (schema) => window.monacoAutocomplete.updateSchema(schema),
    showCompletions: (element) => window.monacoAutocomplete.showCompletions(element),
    hideCompletions: (element) => window.monacoAutocomplete.hideCompletions(element)
};

// Export for module use
export { MonacoAutocompleteManager };