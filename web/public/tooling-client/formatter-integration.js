/**
 * Formatter Integration
 * Adds formatting capabilities to formula inputs
 */

class FormatterIntegration {
    constructor() {
        this.formattableElements = new Map();
        this.formatButtons = new Map();
    }

    /**
     * Attach formatter to a textarea with optional format button
     */
    attachTo(textarea, options = {}) {
        const config = {
            showButton: options.showButton !== false,
            buttonText: options.buttonText || 'Format',
            buttonPosition: options.buttonPosition || 'after',
            keyboardShortcut: options.keyboardShortcut !== false,
            autoFormat: options.autoFormat || false,
            ...options
        };

        // Store reference
        this.formattableElements.set(textarea, config);

        // Add format button if requested
        if (config.showButton) {
            this.addFormatButton(textarea, config);
        }

        // Add keyboard shortcut
        if (config.keyboardShortcut) {
            this.addKeyboardShortcut(textarea);
        }

        // Add auto-format if requested
        if (config.autoFormat) {
            this.addAutoFormat(textarea, config.autoFormat);
        }

        return this;
    }

    /**
     * Detach formatter from textarea
     */
    detachFrom(textarea) {
        // Remove format button
        const button = this.formatButtons.get(textarea);
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }

        // Clean up references
        this.formattableElements.delete(textarea);
        this.formatButtons.delete(textarea);
    }

    /**
     * Add format button to textarea
     */
    addFormatButton(textarea, config) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = config.buttonText;
        button.className = 'format-button btn btn-secondary';
        button.title = 'Format formula (Shift+Alt+F)';
        
        // Style the button
        button.style.cssText = `
            margin-left: 8px;
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
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
            this.formatTextarea(textarea);
        });

        // Position button based on config
        this.positionButton(textarea, button, config.buttonPosition);
        
        // Store reference
        this.formatButtons.set(textarea, button);

        return button;
    }

    /**
     * Position format button relative to textarea
     */
    positionButton(textarea, button, position) {
        switch (position) {
            case 'after':
                // Insert after textarea
                if (textarea.nextSibling) {
                    textarea.parentNode.insertBefore(button, textarea.nextSibling);
                } else {
                    textarea.parentNode.appendChild(button);
                }
                break;

            case 'before':
                // Insert before textarea
                textarea.parentNode.insertBefore(button, textarea);
                break;

            case 'above':
                // Create wrapper and insert above
                const aboveWrapper = document.createElement('div');
                aboveWrapper.style.marginBottom = '8px';
                aboveWrapper.appendChild(button);
                textarea.parentNode.insertBefore(aboveWrapper, textarea);
                break;

            case 'below':
                // Create wrapper and insert below
                const belowWrapper = document.createElement('div');
                belowWrapper.style.marginTop = '8px';
                belowWrapper.appendChild(button);
                if (textarea.nextSibling) {
                    textarea.parentNode.insertBefore(belowWrapper, textarea.nextSibling);
                } else {
                    textarea.parentNode.appendChild(belowWrapper);
                }
                break;

            case 'inline':
                // Create inline wrapper
                const inlineWrapper = document.createElement('div');
                inlineWrapper.style.cssText = 'display: flex; align-items: center; gap: 8px;';
                
                // Wrap textarea and button
                textarea.parentNode.insertBefore(inlineWrapper, textarea);
                inlineWrapper.appendChild(textarea);
                inlineWrapper.appendChild(button);
                break;
        }
    }

    /**
     * Add keyboard shortcut for formatting
     */
    addKeyboardShortcut(textarea) {
        textarea.addEventListener('keydown', (e) => {
            // Shift+Alt+F to format
            if (e.shiftKey && e.altKey && e.key === 'F') {
                e.preventDefault();
                this.formatTextarea(textarea);
            }
        });
    }

    /**
     * Add auto-formatting on blur or specific triggers
     */
    addAutoFormat(textarea, autoFormatConfig) {
        const config = typeof autoFormatConfig === 'object' ? autoFormatConfig : {};
        
        if (config.onBlur !== false) {
            textarea.addEventListener('blur', () => {
                // Auto-format when losing focus
                this.formatTextarea(textarea, { silent: true });
            });
        }

        if (config.onEnter) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    // Auto-format on Enter (but not Shift+Enter)
                    setTimeout(() => {
                        this.formatTextarea(textarea, { silent: true });
                    }, 10);
                }
            });
        }

        if (config.onSave && (config.onSave.key || config.onSave.keys)) {
            textarea.addEventListener('keydown', (e) => {
                const keys = config.onSave.keys || [config.onSave.key];
                const matchesKey = keys.some(key => {
                    if (typeof key === 'string') {
                        return e.key === key && e.ctrlKey;
                    } else {
                        return e.key === key.key && 
                               e.ctrlKey === !!key.ctrl && 
                               e.shiftKey === !!key.shift &&
                               e.altKey === !!key.alt;
                    }
                });

                if (matchesKey) {
                    this.formatTextarea(textarea, { silent: true });
                }
            });
        }
    }

    /**
     * Format a specific textarea
     */
    async formatTextarea(textarea, options = {}) {
        const config = this.formattableElements.get(textarea);
        if (!config) return;

        const originalValue = textarea.value;
        const originalSelection = {
            start: textarea.selectionStart,
            end: textarea.selectionEnd
        };

        try {
            // Show loading state on button
            const button = this.formatButtons.get(textarea);
            const originalButtonText = button?.textContent;
            if (button && !options.silent) {
                button.textContent = 'Formatting...';
                button.disabled = true;
            }

            // Format the text
            const formatted = await window.developerToolsClient.format(originalValue);

            // Only update if text actually changed
            if (formatted !== originalValue) {
                textarea.value = formatted;

                // Try to preserve cursor position intelligently
                this.preserveCursorPosition(textarea, originalValue, formatted, originalSelection);

                // Trigger events for other components
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true }));

                // Show success feedback
                if (!options.silent) {
                    this.showFormatFeedback(textarea, 'success');
                }
            } else if (!options.silent) {
                // Show "already formatted" feedback
                this.showFormatFeedback(textarea, 'already-formatted');
            }

            // Restore button state
            if (button && !options.silent) {
                button.textContent = originalButtonText;
                button.disabled = false;
            }

        } catch (error) {
            console.warn('Format error:', error);
            
            // Restore button state
            const button = this.formatButtons.get(textarea);
            if (button && !options.silent) {
                button.textContent = originalButtonText || 'Format';
                button.disabled = false;
            }

            // Show error feedback
            if (!options.silent) {
                this.showFormatFeedback(textarea, 'error', error.message);
            }
        }
    }

    /**
     * Preserve cursor position after formatting
     */
    preserveCursorPosition(textarea, originalText, formattedText, originalSelection) {
        // Simple approach: try to maintain relative position
        const originalLength = originalText.length;
        const formattedLength = formattedText.length;
        
        if (originalLength === 0) {
            textarea.setSelectionRange(0, 0);
            return;
        }

        // Calculate relative positions
        const relativeStart = originalSelection.start / originalLength;
        const relativeEnd = originalSelection.end / originalLength;

        // Apply to formatted text
        const newStart = Math.round(relativeStart * formattedLength);
        const newEnd = Math.round(relativeEnd * formattedLength);

        // Ensure valid range
        const clampedStart = Math.max(0, Math.min(newStart, formattedLength));
        const clampedEnd = Math.max(clampedStart, Math.min(newEnd, formattedLength));

        textarea.setSelectionRange(clampedStart, clampedEnd);
    }

    /**
     * Show formatting feedback
     */
    showFormatFeedback(textarea, type, message = null) {
        // Remove existing feedback
        const existing = document.querySelector('.format-feedback');
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
            background: ${bgColor};
            color: ${textColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid;
            border-color: ${textColor}40;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            pointer-events: none;
        `;

        // Position feedback near textarea
        const rect = textarea.getBoundingClientRect();
        feedback.style.left = `${rect.right + window.scrollX - 100}px`;
        feedback.style.top = `${rect.top + window.scrollY - 30}px`;

        document.body.appendChild(feedback);

        // Auto-remove after delay
        setTimeout(() => {
            feedback.remove();
        }, type === 'error' ? 4000 : 2000);
    }

    /**
     * Format all attached textareas
     */
    async formatAll(options = {}) {
        const promises = Array.from(this.formattableElements.keys()).map(textarea => {
            return this.formatTextarea(textarea, options);
        });

        await Promise.all(promises);
    }

    /**
     * Create enhanced textarea with formatting
     */
    createFormattedTextarea(container, options = {}) {
        const textarea = document.createElement('textarea');
        
        // Apply basic options
        Object.assign(textarea, {
            className: options.className || 'formula-input',
            placeholder: options.placeholder || 'Enter formula...',
            rows: options.rows || 3,
            ...options.attributes
        });

        // Add to container
        container.appendChild(textarea);
        
        // Attach formatter
        this.attachTo(textarea, options.formatter || {});
        
        // Attach other tools if available
        if (window.syntaxHighlighting) {
            window.syntaxHighlighting.attachTo(textarea, options.tableName);
        }
        
        if (window.autocomplete) {
            window.autocomplete.attachTo(textarea, options.tableName);
        }
        
        return textarea;
    }

    /**
     * Add format button to existing button group
     */
    addToButtonGroup(buttonGroup, textarea, options = {}) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = options.text || 'Format';
        button.className = options.className || 'btn btn-secondary';
        button.title = 'Format formula (Shift+Alt+F)';

        // Add click handler
        button.addEventListener('click', () => {
            this.formatTextarea(textarea);
        });

        // Add to button group
        buttonGroup.appendChild(button);
        
        // Store reference
        this.formatButtons.set(textarea, button);

        return button;
    }

    /**
     * Check if textarea is already formatted
     */
    async isFormatted(textarea) {
        try {
            const text = textarea.value;
            const formatted = await window.developerToolsClient.format(text);
            return text === formatted;
        } catch (error) {
            console.warn('Format check error:', error);
            return true; // Assume formatted if check fails
        }
    }

    /**
     * Get format button for textarea
     */
    getFormatButton(textarea) {
        return this.formatButtons.get(textarea);
    }

    /**
     * Update format button state based on content
     */
    async updateButtonState(textarea) {
        const button = this.formatButtons.get(textarea);
        if (!button) return;

        try {
            const isFormatted = await this.isFormatted(textarea);
            
            if (isFormatted) {
                button.style.opacity = '0.6';
                button.title = 'Already formatted';
            } else {
                button.style.opacity = '1';
                button.title = 'Format formula (Shift+Alt+F)';
            }
        } catch (error) {
            // Reset to default state on error
            button.style.opacity = '1';
            button.title = 'Format formula (Shift+Alt+F)';
        }
    }
}

// Global formatter integration instance
window.formatterIntegration = new FormatterIntegration();

// CSS for format buttons and feedback
const formatterCSS = `
.format-button:hover {
    background-color: #e9ecef !important;
    border-color: #adb5bd !important;
}

.format-button:active {
    background-color: #dee2e6 !important;
    transform: translateY(1px);
}

.format-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.format-feedback {
    animation: formatFeedbackSlide 0.3s ease-out;
}

@keyframes formatFeedbackSlide {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Format button variants */
.format-button-compact {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 60px;
}

.format-button-large {
    padding: 8px 16px;
    font-size: 14px;
    min-width: 80px;
}

/* Format status indicator */
.format-status {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 4px;
}

.format-status.formatted {
    background-color: #28a745;
}

.format-status.unformatted {
    background-color: #ffc107;
}

.format-status.unknown {
    background-color: #6c757d;
}
`;

// Add styles to page
const style = document.createElement('style');
style.textContent = formatterCSS;
document.head.appendChild(style);