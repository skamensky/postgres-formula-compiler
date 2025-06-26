/**
 * Monaco Formatter Integration
 * Provides formatting capabilities using Monaco's document formatting system
 */

class MonacoFormatterIntegration {
    constructor() {
        this.isReady = false;
        this.formatButtons = new Map(); // For backward compatibility
        
        // Wait for Monaco to be available
        this.waitForMonaco();
    }

    async waitForMonaco() {
        // Poll for Monaco availability
        while (!window.monaco || !window.monaco.languages || !window.monaco.languages.registerDocumentFormattingProvider) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.isReady = true;
        this.initialize();
    }

    initialize() {
        if (!this.isReady || !window.monaco || !window.monaco.languages) return;

        // Register document formatting provider
        const formatProvider = {
            provideDocumentFormattingEdits: async (model, options) => {
                try {
                    const text = model.getValue();
                    const formatted = await this.formatText(text);
                    
                    if (formatted !== text) {
                        return [{
                            range: model.getFullModelRange(),
                            text: formatted
                        }];
                    }
                    
                    return [];
                } catch (error) {
                    console.warn('Format provider error:', error);
                    return [];
                }
            }
        };

        monaco.languages.registerDocumentFormattingProvider('formula', formatProvider);
        
        // Register range formatting provider
        const rangeFormatProvider = {
            provideDocumentRangeFormattingEdits: async (model, range, options) => {
                try {
                    const text = model.getValueInRange(range);
                    const formatted = await this.formatText(text);
                    
                    if (formatted !== text) {
                        return [{
                            range: range,
                            text: formatted
                        }];
                    }
                    
                    return [];
                } catch (error) {
                    console.warn('Range format provider error:', error);
                    return [];
                }
            }
        };

        monaco.languages.registerDocumentRangeFormattingProvider('formula', rangeFormatProvider);
    }

    /**
     * Format text using developer tools client
     */
    async formatText(text) {
        if (window.developerToolsClient && window.developerToolsClient.format) {
            return await window.developerToolsClient.format(text);
        }
        
        // Fallback basic formatting
        return this.basicFormat(text);
    }

    /**
     * Basic formatting fallback
     */
    basicFormat(text) {
        // Basic formatting rules
        return text
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/\s*\(\s*/g, '(')  // Remove spaces around opening parentheses
            .replace(/\s*\)\s*/g, ')')  // Remove spaces around closing parentheses
            .replace(/\s*,\s*/g, ', ')  // Normalize comma spacing
            .replace(/\s*([+\-*/&<>=!]+)\s*/g, ' $1 ')  // Normalize operator spacing
            .trim();
    }

    /**
     * Attach formatter to Monaco editor wrapper (compatibility method)
     */
    attachTo(editorWrapper, options = {}) {
        if (!editorWrapper || !editorWrapper._monaco) return this;
        
        const editor = editorWrapper._monaco;
        const config = {
            showButton: options.showButton !== false,
            buttonText: options.buttonText || 'Format',
            keyboardShortcut: options.keyboardShortcut !== false,
            autoFormat: options.autoFormat || false,
            ...options
        };

        // Store configuration on editor
        editor._formatterConfig = config;
        
        // Add format button if requested
        if (config.showButton) {
            this.addFormatButton(editorWrapper, config);
        }

        // Add keyboard shortcut (Shift+Alt+F)
        if (config.keyboardShortcut) {
            this.addKeyboardShortcut(editorWrapper);
        }

        // Add auto-format if requested
        if (config.autoFormat) {
            this.addAutoFormat(editorWrapper, config.autoFormat);
        }

        // Enable Monaco's built-in formatting
        editor.updateOptions({
            formatOnPaste: true,
            formatOnType: false  // Can be enabled if needed
        });

        console.log('✨ Monaco formatter attached');
        return this;
    }

    /**
     * Detach formatter from editor wrapper
     */
    detachFrom(editorWrapper) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        
        // Remove format button
        const button = this.formatButtons.get(editorWrapper);
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
        this.formatButtons.delete(editorWrapper);
        
        // Clear configuration
        delete editor._formatterConfig;
        
        console.log('✨ Monaco formatter detached');
    }

    /**
     * Add format button
     */
    addFormatButton(editorWrapper, config) {
        const editor = editorWrapper._monaco;
        const container = editor.getDomNode().parentElement;
        
        if (!container) return;
        
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = config.buttonText;
        button.className = 'format-button btn btn-secondary';
        button.title = 'Format formula (Shift+Alt+F)';
        
        // Style the button
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 10;
            padding: 4px 8px;
            font-size: 11px;
            border-radius: 3px;
            border: 1px solid #ccc;
            background: #f8f9fa;
            color: #495057;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // Add hover effect
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#e9ecef';
            button.style.borderColor = '#adb5bd';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#f8f9fa';
            button.style.borderColor = '#ccc';
        });

        // Add click handler
        button.addEventListener('click', () => {
            this.formatEditor(editorWrapper);
        });

        // Add to container
        container.style.position = 'relative';
        container.appendChild(button);
        
        this.formatButtons.set(editorWrapper, button);
    }

    /**
     * Add keyboard shortcut
     */
    addKeyboardShortcut(editorWrapper) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        
        // Add keybinding for Shift+Alt+F
        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
            this.formatEditor(editorWrapper);
        });
    }

    /**
     * Add auto-format triggers
     */
    addAutoFormat(editorWrapper, autoFormatConfig) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const config = typeof autoFormatConfig === 'object' ? autoFormatConfig : {};
        
        if (config.onBlur !== false) {
            editor.onDidBlurEditorText(() => {
                this.formatEditor(editorWrapper, { silent: true });
            });
        }

        if (config.onSave) {
            // Add Ctrl+S keybinding
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.formatEditor(editorWrapper, { silent: true });
            });
        }
    }

    /**
     * Format editor using Monaco's formatting
     */
    async formatEditor(editorWrapper, options = {}) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const button = this.formatButtons.get(editorWrapper);
        
        try {
            // Show loading state
            if (button && !options.silent) {
                button.textContent = 'Formatting...';
                button.disabled = true;
            }
            
            // Trigger Monaco's formatting
            await editor.getAction('editor.action.formatDocument').run();
            
            // Show success feedback
            if (!options.silent) {
                this.showFormatFeedback(editorWrapper, 'success');
            }
            
        } catch (error) {
            console.warn('Format error:', error);
            
            if (!options.silent) {
                this.showFormatFeedback(editorWrapper, 'error', error.message);
            }
        } finally {
            // Restore button state
            if (button && !options.silent) {
                button.textContent = 'Format';
                button.disabled = false;
            }
        }
    }

    /**
     * Format specific text directly
     */
    async formatTextarea(editorWrapper, options = {}) {
        // Alias for backward compatibility
        return this.formatEditor(editorWrapper, options);
    }

    /**
     * Show formatting feedback
     */
    showFormatFeedback(editorWrapper, type, message = null) {
        if (!editorWrapper || !editorWrapper._monaco) return;
        
        const editor = editorWrapper._monaco;
        const container = editor.getDomNode().parentElement;
        
        if (!container) return;
        
        // Remove existing feedback
        const existing = container.querySelector('.format-feedback');
        if (existing) {
            existing.remove();
        }

        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `format-feedback format-feedback-${type}`;
        
        let text = '';
        let bgColor = '';
        let textColor = '';

        switch (type) {
            case 'success':
                text = '✓ Formatted';
                bgColor = '#d4edda';
                textColor = '#155724';
                break;
            case 'already-formatted':
                text = 'Already formatted';
                bgColor = '#fff3cd';
                textColor = '#856404';
                break;
            case 'error':
                text = `✗ Format error: ${message || 'Unknown error'}`;
                bgColor = '#f8d7da';
                textColor = '#721c24';
                break;
        }

        feedback.textContent = text;
        feedback.style.cssText = `
            position: absolute;
            top: 35px;
            right: 8px;
            background: ${bgColor};
            color: ${textColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            z-index: 1000;
            border: 1px solid;
            border-color: ${textColor}40;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            pointer-events: none;
        `;

        container.appendChild(feedback);

        // Auto-remove after delay
        setTimeout(() => {
            feedback.remove();
        }, type === 'error' ? 4000 : 2000);
    }

    /**
     * Check if editor content is formatted
     */
    async isFormatted(editorWrapper) {
        if (!editorWrapper || !editorWrapper._monaco) return true;
        
        try {
            const editor = editorWrapper._monaco;
            const text = editor.getValue();
            const formatted = await this.formatText(text);
            return text === formatted;
        } catch (error) {
            console.warn('Format check error:', error);
            return true;
        }
    }

    /**
     * Get format button for editor
     */
    getFormatButton(editorWrapper) {
        return this.formatButtons.get(editorWrapper);
    }

    /**
     * Create formatted editor (helper method)
     */
    createFormattedEditor(containerId, options = {}) {
        if (!window.monacoWrapper) return null;
        
        const editorWrapper = window.monacoWrapper.createEditor(containerId, options);
        
        if (editorWrapper) {
            this.attachTo(editorWrapper, options.formatter || {});
        }
        
        return editorWrapper;
    }

    /**
     * Format all text in editor
     */
    async formatAll(editorWrapper, options = {}) {
        return this.formatEditor(editorWrapper, options);
    }

    /**
     * Add format button to existing button group (compatibility method)
     */
    addToButtonGroup(buttonGroup, editorWrapper, options = {}) {
        if (!buttonGroup || !editorWrapper) return null;
        
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = options.text || 'Format';
        button.className = options.className || 'btn btn-secondary';
        button.title = 'Format formula (Shift+Alt+F)';

        // Add click handler
        button.addEventListener('click', () => {
            this.formatEditor(editorWrapper);
        });

        // Add to button group
        buttonGroup.appendChild(button);
        
        // Store reference
        this.formatButtons.set(editorWrapper, button);

        return button;
    }
}

// Global formatter integration instance
window.monacoFormatterIntegration = new MonacoFormatterIntegration();

// Maintain backward compatibility
window.formatterIntegration = {
    attachTo: (element, options) => window.monacoFormatterIntegration.attachTo(element, options),
    detachFrom: (element) => window.monacoFormatterIntegration.detachFrom(element),
    formatTextarea: (element, options) => window.monacoFormatterIntegration.formatTextarea(element, options),
    isFormatted: (element) => window.monacoFormatterIntegration.isFormatted(element),
    getFormatButton: (element) => window.monacoFormatterIntegration.getFormatButton(element),
    formatAll: (element, options) => window.monacoFormatterIntegration.formatAll(element, options),
    addToButtonGroup: (buttonGroup, element, options) => window.monacoFormatterIntegration.addToButtonGroup(buttonGroup, element, options)
};

// Export for module use
export { MonacoFormatterIntegration };