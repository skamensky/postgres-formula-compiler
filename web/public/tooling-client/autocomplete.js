/**
 * Autocomplete Module
 * Provides intelligent code completion for formula inputs
 */

class AutocompleteManager {
    constructor() {
        this.isVisible = false;
        this.selectedIndex = 0;
        this.completions = [];
        this.currentInput = null;
        this.debounceTimeout = null;
        this.currentSchema = null;
        
        this.initializeUI();
        this.bindGlobalEvents();
    }

    /**
     * Initialize autocomplete UI elements
     */
    initializeUI() {
        // Create autocomplete dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.cssText = `
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-height: 200px;
            overflow-y: auto;
            display: none;
            min-width: 200px;
        `;
        document.body.appendChild(this.dropdown);
    }

    /**
     * Bind global events for autocomplete
     */
    bindGlobalEvents() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && e.target !== this.currentInput) {
                this.hide();
            }
        });

        // Hide on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isVisible) {
                this.updatePosition();
            }
        });

        // Hide when scrolling
        document.addEventListener('scroll', () => {
            if (this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Attach autocomplete to a textarea or input
     */
    attachTo(inputElement, tableName = null) {
        // Remove existing listeners if already attached
        this.detachFrom(inputElement);
        
        // Store reference
        const context = { tableName };
        
        // Create bound functions so we can remove them later
        const inputHandler = (e) => this.handleInput(e.target, context);
        const keydownHandler = (e) => this.handleKeydown(e, inputElement, context);
        const focusHandler = (e) => {
            // Small delay to show completions when focusing empty input
            setTimeout(() => {
                if (e.target.value.trim() === '') {
                    this.handleInput(e.target, context);
                }
            }, 100);
        };
        const blurHandler = () => {
            // Delay hiding to allow click on dropdown
            setTimeout(() => this.hide(), 150);
        };
        
        // Bind events to the input
        inputElement.addEventListener('input', inputHandler);
        inputElement.addEventListener('keydown', keydownHandler);
        inputElement.addEventListener('focus', focusHandler);
        inputElement.addEventListener('blur', blurHandler);
        
        // Store handlers for cleanup
        inputElement._autocompleteHandlers = {
            input: inputHandler,
            keydown: keydownHandler,
            focus: focusHandler,
            blur: blurHandler,
            context: context
        };
        
        console.log('🔧 Autocomplete attached to input for table:', tableName);
    }

    /**
     * Detach autocomplete from an input
     */
    detachFrom(inputElement) {
        if (inputElement._autocompleteHandlers) {
            const handlers = inputElement._autocompleteHandlers;
            inputElement.removeEventListener('input', handlers.input);
            inputElement.removeEventListener('keydown', handlers.keydown);
            inputElement.removeEventListener('focus', handlers.focus);
            inputElement.removeEventListener('blur', handlers.blur);
            delete inputElement._autocompleteHandlers;
            console.log('🔧 Autocomplete detached from input');
        }
    }

    /**
     * Update schema for enhanced completions
     */
    updateSchema(schema) {
        this.currentSchema = schema;
    }

    /**
     * Handle input events
     */
    handleInput(input, context) {
        // Clear previous timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Debounce to avoid too many requests
        this.debounceTimeout = setTimeout(() => {
            this.requestCompletions(input, context);
        }, 300);
    }

    /**
     * Handle keyboard events
     */
    handleKeydown(e, input, context) {
        if (!this.isVisible) {
            // Show completions on Ctrl+Space
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                this.requestCompletions(input, context);
                return;
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.completions.length - 1);
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
                
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                this.insertCompletion(input);
                break;
                
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
        }
    }

    /**
     * Request completions from developer tools
     */
    async requestCompletions(input, context) {
        try {
            const text = input.value;
            const position = input.selectionStart;
            
            // Get completions from developer tools
            const completions = await window.developerToolsClient.getCompletions(
                text, 
                position, 
                context.tableName
            );

            if (completions.length > 0) {
                this.show(input, completions);
            } else {
                this.hide();
            }
            
        } catch (error) {
            console.warn('Autocomplete error:', error);
            this.hide();
        }
    }

    /**
     * Show autocomplete dropdown
     */
    show(input, completions) {
        this.currentInput = input;
        this.completions = completions;
        this.selectedIndex = 0;
        
        // Update dropdown content
        this.updateDropdownContent();
        
        // Position dropdown
        this.updatePosition();
        
        // Show dropdown
        this.dropdown.style.display = 'block';
        this.isVisible = true;
        
        // Update selection
        this.updateSelection();
    }

    /**
     * Hide autocomplete dropdown
     */
    hide() {
        this.dropdown.style.display = 'none';
        this.isVisible = false;
        this.currentInput = null;
        this.completions = [];
        this.selectedIndex = 0;
    }

    /**
     * Update dropdown content
     */
    updateDropdownContent() {
        this.dropdown.innerHTML = '';
        
        this.completions.forEach((completion, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.dataset.index = index;
            
            // Build item content
            const icon = this.getCompletionIcon(completion.kind);
            const label = completion.label;
            const detail = completion.detail || '';
            const doc = completion.documentation || '';
            
            item.innerHTML = `
                <div class="completion-main">
                    <span class="completion-icon">${icon}</span>
                    <span class="completion-label">${this.escapeHtml(label)}</span>
                    <span class="completion-detail">${this.escapeHtml(detail)}</span>
                </div>
                ${doc ? `<div class="completion-doc">${this.escapeHtml(doc)}</div>` : ''}
            `;
            
            // Add styling
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background-color 0.1s;
            `;
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
            
            // Add click handler
            item.addEventListener('click', () => {
                this.selectedIndex = index;
                this.insertCompletion(this.currentInput);
            });
            
            this.dropdown.appendChild(item);
        });
    }

    /**
     * Update position of dropdown
     */
    updatePosition() {
        if (!this.currentInput) return;
        
        const inputRect = this.currentInput.getBoundingClientRect();
        const dropdownRect = this.dropdown.getBoundingClientRect();
        
        // Position below input
        let top = inputRect.bottom + window.scrollY;
        let left = inputRect.left + window.scrollX;
        
        // Adjust if dropdown would go off screen
        if (left + dropdownRect.width > window.innerWidth) {
            left = window.innerWidth - dropdownRect.width - 10;
        }
        
        if (top + dropdownRect.height > window.innerHeight + window.scrollY) {
            // Position above input if no room below
            top = inputRect.top + window.scrollY - dropdownRect.height;
        }
        
        this.dropdown.style.left = `${left}px`;
        this.dropdown.style.top = `${top}px`;
    }

    /**
     * Update visual selection
     */
    updateSelection() {
        const items = this.dropdown.querySelectorAll('.autocomplete-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.backgroundColor = '#f0f8ff';
                item.style.borderLeft = '3px solid #667eea';
            } else {
                item.style.backgroundColor = '';
                item.style.borderLeft = '';
            }
        });
    }

    /**
     * Insert selected completion
     */
    insertCompletion(input) {
        if (!this.completions[this.selectedIndex]) {
            return;
        }
        
        const completion = this.completions[this.selectedIndex];
        const text = input.value;
        const position = input.selectionStart;
        
        // Find the word being completed
        const beforeCursor = text.substring(0, position);
        const afterCursor = text.substring(position);
        
        // Find start of current word
        const wordMatch = beforeCursor.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);
        const wordStart = wordMatch ? position - wordMatch[0].length : position;
        
        // Build new text
        const beforeWord = text.substring(0, wordStart);
        const insertText = completion.insertText || completion.label;
        const newText = beforeWord + insertText + afterCursor;
        
        // Update input
        input.value = newText;
        
        // Set cursor position
        const newCursorPos = wordStart + insertText.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        
        // Hide dropdown
        this.hide();
        
        // Trigger input event for any listeners
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Focus back to input
        input.focus();
    }

    /**
     * Get icon for completion type
     */
    getCompletionIcon(kind) {
        const icons = {
            'function': '𝑓',
            'keyword': '⌨',
            'field': '📄',
            'relationship': '🔗',
            'literal': '💡',
            'operator': '⚙'
        };
        return icons[kind] || '•';
    }

    /**
     * Escape HTML for safe insertion
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show completion hint for current input
     */
    async showHint(input, tableName = null) {
        try {
            const text = input.value;
            const position = input.selectionStart;
            
            const hover = await window.developerToolsClient.getHover(text, position);
            
            if (hover && hover.contents) {
                this.showTooltip(input, hover.contents);
            }
            
        } catch (error) {
            console.warn('Hover error:', error);
        }
    }

    /**
     * Show tooltip with information
     */
    showTooltip(input, content) {
        // Remove existing tooltip
        const existing = document.querySelector('.autocomplete-tooltip');
        if (existing) {
            existing.remove();
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'autocomplete-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            z-index: 1001;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            max-width: 300px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
        `;
        
        tooltip.textContent = content;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const inputRect = input.getBoundingClientRect();
        tooltip.style.left = `${inputRect.left + window.scrollX}px`;
        tooltip.style.top = `${inputRect.top + window.scrollY - 40}px`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }
}

// Global autocomplete instance
window.autocomplete = new AutocompleteManager();

// CSS styles for autocomplete
const autocompleteCSS = `
.autocomplete-dropdown {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 13px;
    border: 1px solid #ccc;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.autocomplete-item:last-child {
    border-bottom: none;
}

.completion-main {
    display: flex;
    align-items: center;
    gap: 6px;
}

.completion-icon {
    width: 16px;
    text-align: center;
    font-weight: bold;
    color: #666;
}

.completion-label {
    font-weight: 500;
    color: #333;
}

.completion-detail {
    color: #666;
    font-size: 11px;
    margin-left: auto;
}

.completion-doc {
    margin-top: 4px;
    font-size: 11px;
    color: #888;
    font-style: italic;
}

.autocomplete-tooltip {
    white-space: pre-wrap;
    line-height: 1.4;
}
`;

// Add CSS to page
const style = document.createElement('style');
style.textContent = autocompleteCSS;
document.head.appendChild(style);