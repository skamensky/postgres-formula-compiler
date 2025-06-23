/**
 * Monaco Editor Integration
 * Provides a Monaco-based editor with textarea-like interface for compatibility
 */

class MonacoEditorWrapper {
    constructor() {
        this.editors = new Map();
        this.initializeMonaco();
    }

    async initializeMonaco() {
        // Configure Monaco loader
        require.config({ 
            paths: { 
                'vs': '/node_modules/monaco-editor/min/vs' 
            } 
        });

        // Wait for Monaco to load
        await new Promise(resolve => {
            require(['vs/editor/editor.main'], () => {
                // Additional wait to ensure all APIs are available
                setTimeout(() => {
                    this.setupLanguage();
                    resolve();
                }, 100);
            });
        });
    }

    setupLanguage() {
        // Register our formula language
        monaco.languages.register({ id: 'formula' });

        // Set language configuration
        monaco.languages.setLanguageConfiguration('formula', {
            brackets: [
                ['(', ')'],
                ['[', ']']
            ],
            autoClosingPairs: [
                { open: '(', close: ')' },
                { open: '[', close: ']' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            surroundingPairs: [
                { open: '(', close: ')' },
                { open: '[', close: ']' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });

        // Set basic token provider (will be enhanced by syntax highlighting)
        monaco.languages.setMonarchTokensProvider('formula', {
            tokenizer: {
                root: [
                    [/[a-zA-Z_][\w]*/, 'identifier'],
                    [/\d+/, 'number'],
                    [/".*?"/, 'string'],
                    [/'.*?'/, 'string'],
                    [/[()[\]]/, 'delimiter'],
                    [/[+\-*/&]/, 'operator'],
                    [/[<>=!]+/, 'operator'],
                    [/\s+/, 'white']
                ]
            }
        });

        // Set theme
        monaco.editor.defineTheme('formula-theme', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'identifier', foreground: '374151' },
                { token: 'number', foreground: '059669' },
                { token: 'string', foreground: 'dc2626' },
                { token: 'operator', foreground: '7c2d12' },
                { token: 'delimiter', foreground: '6b7280' }
            ]
        });
    }

    /**
     * Create Monaco Editor in container with textarea-like interface
     */
    createEditor(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }

        const editor = monaco.editor.create(container, {
            value: options.value || '',
            language: 'formula',
            theme: 'formula-theme',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            ...options.monacoOptions
        });

        // Make container Playwright-compatible
        container.setAttribute('contenteditable', 'true');
        container.setAttribute('role', 'textbox');
        container.setAttribute('aria-label', 'Formula editor');
        
        // Add Playwright-compatible methods directly to the container
        container.fill = async (text) => {
            editor.setValue(text || '');
        };
        
        container.clear = async () => {
            editor.setValue('');
        };
        
        container.type = async (text) => {
            const currentValue = editor.getValue();
            const newValue = currentValue + text;
            editor.setValue(newValue);
        };
        
        container.inputValue = () => {
            return editor.getValue();
        };
        
        container.press = async (key) => {
            if (key === 'Enter') {
                // Trigger Enter key handling
                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                const handlers = container._keyHandlers || [];
                handlers.forEach(handler => handler(event));
            }
        };
        
        container._keyHandlers = [];

        // Create textarea-like interface
        const wrapper = this.createTextareaWrapper(editor, containerId);
        
        this.editors.set(containerId, { editor, wrapper });
        
        return wrapper;
    }

    /**
     * Create a wrapper that provides textarea-like interface
     */
    createTextareaWrapper(editor, containerId) {
        const wrapper = {
            // Monaco editor instance
            _monaco: editor,
            
            // Textarea-like properties
            get value() {
                return editor.getValue();
            },
            
            set value(val) {
                editor.setValue(val || '');
            },

            // Playwright compatibility
            async fill(text) {
                editor.setValue(text || '');
                // Trigger input event for other components
                wrapper._triggerInputEvent();
            },

            async clear() {
                editor.setValue('');
                wrapper._triggerInputEvent();
            },

            async type(text) {
                const currentValue = editor.getValue();
                const newValue = currentValue + text;
                editor.setValue(newValue);
                wrapper._triggerInputEvent();
            },

            _triggerInputEvent() {
                // Trigger input event for validation and other handlers
                if (wrapper._inputHandlers) {
                    wrapper._inputHandlers.forEach(handler => {
                        handler({ target: wrapper, type: 'input' });
                    });
                }
            },

            _inputHandlers: [],

            // Make the div behave like an input for Playwright
            getAttribute(name) {
                if (name === 'contenteditable') return 'true';
                if (name === 'role') return 'textbox';
                return null;
            },
            
            get selectionStart() {
                const selection = editor.getSelection();
                const model = editor.getModel();
                return model.getOffsetAt(selection.getStartPosition());
            },
            
            get selectionEnd() {
                const selection = editor.getSelection();
                const model = editor.getModel();
                return model.getOffsetAt(selection.getEndPosition());
            },
            
            // Textarea-like methods
            focus() {
                editor.focus();
            },
            
            blur() {
                const domNode = editor.getDomNode();
                if (domNode) {
                    domNode.blur();
                }
            },
            
            select() {
                const model = editor.getModel();
                const fullRange = model.getFullModelRange();
                editor.setSelection(fullRange);
            },
            
            setSelectionRange(start, end) {
                const model = editor.getModel();
                const startPos = model.getPositionAt(start);
                const endPos = model.getPositionAt(end);
                editor.setSelection(new monaco.Selection(
                    startPos.lineNumber, startPos.column,
                    endPos.lineNumber, endPos.column
                ));
            },
            
            clear() {
                editor.setValue('');
            },
            
            type(text) {
                const selection = editor.getSelection();
                editor.executeEdits('type', [{
                    range: selection,
                    text: text
                }]);
            },
            
            inputValue() {
                return editor.getValue();
            },
            
            press(key) {
                // Map common keys to Monaco actions
                const keyMap = {
                    'Enter': 'editor.action.insertLineAfter',
                    'Tab': 'editor.action.indentLines',
                    'Escape': () => {
                        // Trigger custom escape handling
                        const event = new KeyboardEvent('keydown', { key: 'Escape' });
                        wrapper.dispatchEvent('keydown', event);
                    }
                };
                
                if (keyMap[key]) {
                    if (typeof keyMap[key] === 'string') {
                        editor.trigger('keyboard', keyMap[key]);
                    } else {
                        keyMap[key]();
                    }
                }
            },
            
            // Event handling
            addEventListener(event, handler) {
                if (event === 'input') {
                    // Store handler for manual triggering
                    wrapper._inputHandlers.push(handler);
                    
                    // Also listen to Monaco's content changes
                    editor.onDidChangeModelContent(() => {
                        handler({
                            target: wrapper,
                            type: 'input'
                        });
                    });
                } else if (event === 'focus') {
                    editor.onDidFocusEditorText(() => {
                        handler({
                            target: wrapper,
                            type: 'focus'
                        });
                    });
                } else if (event === 'blur') {
                    editor.onDidBlurEditorText(() => {
                        handler({
                            target: wrapper,
                            type: 'blur'
                        });
                    });
                } else if (event === 'keydown') {
                    editor.onKeyDown((e) => {
                        const keyEvent = {
                            target: wrapper,
                            type: 'keydown',
                            key: e.code,
                            keyCode: e.keyCode,
                            ctrlKey: e.ctrlKey,
                            shiftKey: e.shiftKey,
                            altKey: e.altKey,
                            preventDefault: () => e.preventDefault(),
                            stopPropagation: () => e.stopPropagation()
                        };
                        handler(keyEvent);
                    });
                }
            },
            
            removeEventListener(event, handler) {
                // Monaco doesn't provide easy removal, so we'll keep references
                // For now, this is a no-op but could be enhanced
            },
            
            dispatchEvent(event, eventObj) {
                // Custom event dispatching for compatibility
                if (event === 'input') {
                    // Trigger input handlers manually
                } else if (event === 'change') {
                    // Trigger change handlers manually
                }
            },
            
            // Properties for compatibility
            className: 'monaco-editor-wrapper',
            id: containerId,
            
            // Additional Monaco-specific methods
            getMonacoEditor() {
                return editor;
            },
            
            registerCompletionProvider(provider) {
                return monaco.languages.registerCompletionItemProvider('formula', provider);
            },
            
            registerHoverProvider(provider) {
                return monaco.languages.registerHoverProvider('formula', provider);
            },
            
            setDecorations(decorations) {
                const ids = editor.deltaDecorations([], decorations);
                return ids;
            },
            
            clearDecorations(ids) {
                editor.deltaDecorations(ids, []);
            }
        };
        
        return wrapper;
    }

    /**
     * Get wrapper for existing editor
     */
    getEditor(containerId) {
        const data = this.editors.get(containerId);
        return data ? data.wrapper : null;
    }

    /**
     * Dispose of editor
     */
    disposeEditor(containerId) {
        const data = this.editors.get(containerId);
        if (data) {
            data.editor.dispose();
            this.editors.delete(containerId);
        }
    }
}

// Global instance
window.monacoWrapper = new MonacoEditorWrapper();

// Export for module use
export { MonacoEditorWrapper };