/**
 * Syntax Highlighting Integration
 * Provides real-time syntax highlighting for formula inputs
 */

class SyntaxHighlightingManager {
    constructor() {
        this.highlightedElements = new Map();
        this.updateTimeouts = new Map();
        this.currentSchema = null;
    }

    /**
     * Attach syntax highlighting to a textarea
     */
    attachTo(textarea, tableName = null) {
        // Create highlighting overlay
        const overlay = this.createHighlightOverlay(textarea);
        
        // Store references
        this.highlightedElements.set(textarea, {
            overlay,
            tableName,
            isActive: true
        });

        // Bind events
        this.bindEvents(textarea, overlay, tableName);

        // Initial highlight
        this.updateHighlighting(textarea, tableName);

        return overlay;
    }

    /**
     * Detach syntax highlighting from element
     */
    detachFrom(textarea) {
        const data = this.highlightedElements.get(textarea);
        if (data) {
            data.isActive = false;
            if (data.overlay && data.overlay.parentNode) {
                data.overlay.parentNode.removeChild(data.overlay);
            }
            this.highlightedElements.delete(textarea);
            
            // Clear timeout
            const timeout = this.updateTimeouts.get(textarea);
            if (timeout) {
                clearTimeout(timeout);
                this.updateTimeouts.delete(textarea);
            }
        }
    }

    /**
     * Update schema for enhanced highlighting
     */
    updateSchema(schema) {
        this.currentSchema = schema;
        
        // Re-highlight all active elements
        this.highlightedElements.forEach((data, textarea) => {
            if (data.isActive) {
                this.updateHighlighting(textarea, data.tableName);
            }
        });
    }

    /**
     * Create highlighting overlay
     */
    createHighlightOverlay(textarea) {
        const container = document.createElement('div');
        container.className = 'syntax-highlight-container';
        
        const overlay = document.createElement('div');
        overlay.className = 'syntax-highlight-overlay';
        
        // Style container to match textarea position
        this.styleContainer(container, textarea);
        
        // Style overlay to match textarea
        this.styleOverlay(overlay, textarea);
        
        // Insert container after textarea
        textarea.parentNode.insertBefore(container, textarea.nextSibling);
        container.appendChild(overlay);
        
        // Update positioning when window resizes
        window.addEventListener('resize', () => {
            this.updatePositioning(container, overlay, textarea);
        });

        return overlay;
    }

    /**
     * Style the container element
     */
    styleContainer(container, textarea) {
        const computedStyle = window.getComputedStyle(textarea);
        
        container.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            line-height: ${computedStyle.lineHeight};
            padding: ${computedStyle.padding};
            border: ${computedStyle.border};
            border-color: transparent;
            background: transparent;
        `;
        
        this.updatePositioning(container, null, textarea);
    }

    /**
     * Style the overlay element
     */
    styleOverlay(overlay, textarea) {
        const computedStyle = window.getComputedStyle(textarea);
        
        overlay.style.cssText = `
            margin: 0;
            padding: 0;
            border: 0;
            background: transparent;
            color: transparent;
            font: inherit;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            min-height: ${computedStyle.height};
            width: 100%;
        `;
    }

    /**
     * Update positioning of overlay
     */
    updatePositioning(container, overlay, textarea) {
        const rect = textarea.getBoundingClientRect();
        const style = window.getComputedStyle(textarea);
        
        container.style.left = (rect.left + window.scrollX) + 'px';
        container.style.top = (rect.top + window.scrollY) + 'px';
        container.style.width = rect.width + 'px';
        container.style.height = rect.height + 'px';
    }

    /**
     * Bind events to textarea
     */
    bindEvents(textarea, overlay, tableName) {
        // Update highlighting on input
        textarea.addEventListener('input', () => {
            this.scheduleUpdate(textarea, tableName);
        });

        // Update highlighting on scroll
        textarea.addEventListener('scroll', () => {
            overlay.scrollTop = textarea.scrollTop;
            overlay.scrollLeft = textarea.scrollLeft;
        });

        // Update positioning on focus
        textarea.addEventListener('focus', () => {
            this.updatePositioning(overlay.parentNode, overlay, textarea);
        });

        // Keep overlay in sync with textarea scroll
        const syncScroll = () => {
            overlay.scrollTop = textarea.scrollTop;
            overlay.scrollLeft = textarea.scrollLeft;
        };

        textarea.addEventListener('scroll', syncScroll);
        textarea.addEventListener('keyup', syncScroll);
        textarea.addEventListener('mouseup', syncScroll);
    }

    /**
     * Schedule highlighting update with debouncing
     */
    scheduleUpdate(textarea, tableName) {
        // Clear previous timeout
        const existingTimeout = this.updateTimeouts.get(textarea);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        // Schedule new update
        const timeout = setTimeout(() => {
            this.updateHighlighting(textarea, tableName);
            this.updateTimeouts.delete(textarea);
        }, 150); // 150ms debounce

        this.updateTimeouts.set(textarea, timeout);
    }

    /**
     * Update highlighting for textarea
     */
    async updateHighlighting(textarea, tableName) {
        const data = this.highlightedElements.get(textarea);
        if (!data || !data.isActive) return;

        try {
            const text = textarea.value;
            const html = await window.developerToolsClient.highlightToHTML(text, tableName);
            
            // Update overlay content
            data.overlay.innerHTML = html;
            
            // Sync scroll position
            data.overlay.scrollTop = textarea.scrollTop;
            data.overlay.scrollLeft = textarea.scrollLeft;
            
        } catch (error) {
            console.warn('Syntax highlighting error:', error);
            // Fallback to plain text
            data.overlay.textContent = textarea.value;
        }
    }

    /**
     * Show/hide syntax highlighting for element
     */
    toggle(textarea, show = null) {
        const data = this.highlightedElements.get(textarea);
        if (!data) return;

        const shouldShow = show !== null ? show : data.overlay.style.display === 'none';
        data.overlay.style.display = shouldShow ? 'block' : 'none';
    }

    /**
     * Enable syntax highlighting globally
     */
    enableAll() {
        this.highlightedElements.forEach((data, textarea) => {
            this.toggle(textarea, true);
            data.isActive = true;
            this.updateHighlighting(textarea, data.tableName);
        });
    }

    /**
     * Disable syntax highlighting globally
     */
    disableAll() {
        this.highlightedElements.forEach((data) => {
            data.isActive = false;
            data.overlay.style.display = 'none';
        });
    }

    /**
     * Get diagnostic markers for textarea
     */
    async updateDiagnostics(textarea, tableName) {
        try {
            const text = textarea.value;
            const diagnostics = await window.developerToolsClient.getDiagnostics(text, tableName);
            
            this.showDiagnosticMarkers(textarea, diagnostics);
            
        } catch (error) {
            console.warn('Diagnostics error:', error);
        }
    }

    /**
     * Show diagnostic markers
     */
    showDiagnosticMarkers(textarea, diagnostics) {
        // Remove existing markers
        const existingMarkers = document.querySelectorAll('.diagnostic-marker');
        existingMarkers.forEach(marker => marker.remove());

        if (diagnostics.length === 0) return;

        // Create markers for each diagnostic
        diagnostics.forEach(diagnostic => {
            const marker = this.createDiagnosticMarker(textarea, diagnostic);
            if (marker) {
                document.body.appendChild(marker);
            }
        });
    }

    /**
     * Create diagnostic marker
     */
    createDiagnosticMarker(textarea, diagnostic) {
        const textValue = textarea.value;
        const start = Math.max(0, diagnostic.range?.start || 0);
        const end = Math.min(textValue.length, diagnostic.range?.end || start + 1);
        
        // Calculate position of error in textarea
        const beforeError = textValue.substring(0, start);
        const lines = beforeError.split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length;
        
        // Create marker
        const marker = document.createElement('div');
        marker.className = `diagnostic-marker diagnostic-${diagnostic.severity}`;
        marker.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: ${diagnostic.severity === 'error' ? '#dc2626' : '#f59e0b'};
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            z-index: 1000;
            cursor: pointer;
        `;
        
        // Position marker
        this.positionDiagnosticMarker(marker, textarea, lineNumber, columnNumber);
        
        // Add tooltip
        marker.title = diagnostic.message;
        
        // Add click handler
        marker.addEventListener('click', () => {
            // Focus textarea and position cursor at error
            textarea.focus();
            textarea.setSelectionRange(start, end);
        });

        return marker;
    }

    /**
     * Position diagnostic marker
     */
    positionDiagnosticMarker(marker, textarea, line, column) {
        const rect = textarea.getBoundingClientRect();
        const style = window.getComputedStyle(textarea);
        const fontSize = parseInt(style.fontSize);
        const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
        
        // Rough positioning based on line/column
        const x = rect.left + window.scrollX + 10 + (column * fontSize * 0.6);
        const y = rect.top + window.scrollY + 10 + ((line - 1) * lineHeight);
        
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
    }

    /**
     * Create enhanced textarea with syntax highlighting
     */
    createEnhancedTextarea(container, options = {}) {
        const textarea = document.createElement('textarea');
        
        // Apply options
        Object.assign(textarea, {
            className: options.className || 'formula-input',
            placeholder: options.placeholder || 'Enter formula...',
            rows: options.rows || 3,
            ...options.attributes
        });

        // Add to container
        container.appendChild(textarea);
        
        // Attach highlighting
        this.attachTo(textarea, options.tableName);
        
        // Attach autocomplete if available
        if (window.autocomplete) {
            window.autocomplete.attachTo(textarea, options.tableName);
        }
        
        return textarea;
    }
}

// Global syntax highlighting instance
window.syntaxHighlighting = new SyntaxHighlightingManager();

// Add CSS for syntax highlighting
const syntaxCSS = `
/* Syntax highlighting styles */
.formula-function {
    color: #0066cc;
    font-weight: bold;
}

.formula-keyword {
    color: #7c3aed;
    font-weight: bold;
}

.formula-number {
    color: #059669;
}

.formula-string {
    color: #dc2626;
}

.formula-operator {
    color: #7c2d12;
    font-weight: bold;
}

.formula-punctuation {
    color: #6b7280;
}

.formula-identifier {
    color: #374151;
}

.formula-column {
    color: #0891b2;
    font-weight: 500;
}

.formula-relationship {
    color: #be185d;
    font-style: italic;
}

.formula-literal {
    color: #7c3aed;
    font-weight: 500;
}

.formula-comment {
    color: #6b7280;
    font-style: italic;
}

.formula-error {
    color: #dc2626;
    background-color: #fef2f2;
    text-decoration: underline wavy #dc2626;
}

/* Hover effects */
.formula-function:hover,
.formula-column:hover,
.formula-relationship:hover {
    background-color: #f3f4f6;
    border-radius: 2px;
}

/* Container positioning */
.syntax-highlight-container {
    pointer-events: none;
}

.syntax-highlight-overlay {
    overflow: hidden;
}

/* Diagnostic markers */
.diagnostic-marker:hover {
    transform: scale(1.2);
    transition: transform 0.1s;
}

.diagnostic-error {
    background-color: #dc2626 !important;
}

.diagnostic-warning {
    background-color: #f59e0b !important;
}

.diagnostic-info {
    background-color: #0ea5e9 !important;
}

/* Enhanced textarea wrapper */
.enhanced-textarea-wrapper {
    position: relative;
    display: inline-block;
}

.enhanced-textarea-wrapper textarea {
    background: transparent;
    z-index: 2;
    position: relative;
}

.enhanced-textarea-wrapper .syntax-highlight-container {
    z-index: 1;
}
`;

// Add styles to page
const style = document.createElement('style');
style.textContent = syntaxCSS;
document.head.appendChild(style);