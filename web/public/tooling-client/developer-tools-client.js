/**
 * Client-side Developer Tools Manager
 * Handles loading and managing LSP, syntax highlighting, and formatting tools
 */

class DeveloperToolsClient {
    constructor() {
        this.tools = null;
        this.schema = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Initialize developer tools
     */
    async initialize() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadTools();
        return this.loadPromise;
    }

    /**
     * Load developer tools directly from modules
     */
    async _loadTools() {
        try {
            // Load the developer tools module directly from modules
            const { createDeveloperTools } = await import('../modules/tooling/developer-tools.js');
            
            // Initialize tools with current schema
            this.tools = createDeveloperTools('default', this.schema);
            
            // Expose LSP instance for direct access
            this.lsp = this.tools.lsp;
            
            this.isLoaded = true;
            
            console.log('✅ Developer tools loaded successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load developer tools:', error);
            // Create a fallback mock implementation
            this.tools = this._createFallbackTools();
            this.lsp = null;
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * Update database schema for all tools
     */
    updateSchema(schema) {
        this.schema = schema;
        if (this.tools && this.isLoaded) {
            this.tools.updateSchema(schema);
            console.log('🔧 Developer tools client schema updated');
        } else {
            // If tools aren't loaded yet, they'll get the schema when they are loaded
            console.log('🔧 Schema stored for when developer tools are loaded');
        }
    }

    /**
     * Get autocomplete suggestions
     */
    async getCompletions(text, position, tableName = null) {
        await this.initialize();
        if (!this.tools) return [];
        
        try {
            return this.tools.getCompletions(text, position, tableName);
        } catch (error) {
            console.warn('Autocomplete error:', error);
            return [];
        }
    }

    /**
     * Get diagnostics (errors/warnings)
     */
    async getDiagnostics(text, tableName = null) {
        await this.initialize();
        if (!this.tools) return [];
        
        try {
            return this.tools.getDiagnostics(text, tableName);
        } catch (error) {
            console.warn('Diagnostics error:', error);
            return [];
        }
    }

    /**
     * Format formula text
     */
    async format(text) {
        await this.initialize();
        if (!this.tools) return text;
        
        try {
            return this.tools.format(text);
        } catch (error) {
            console.warn('Format error:', error);
            return text;
        }
    }

    /**
     * Get syntax highlighting tokens
     */
    async highlight(text, tableName = null) {
        await this.initialize();
        if (!this.tools) return [];
        
        try {
            return this.tools.highlight(text, tableName);
        } catch (error) {
            console.warn('Highlighting error:', error);
            return [];
        }
    }

    /**
     * Generate highlighted HTML
     */
    async highlightToHTML(text, tableName = null) {
        await this.initialize();
        if (!this.tools) return this._escapeHtml(text);
        
        try {
            return this.tools.highlightToHTML(text, tableName);
        } catch (error) {
            console.warn('HTML highlighting error:', error);
            return this._escapeHtml(text);
        }
    }

    /**
     * Get hover information
     */
    async getHover(text, position) {
        await this.initialize();
        if (!this.tools) return null;
        
        try {
            return this.tools.getHover(text, position);
        } catch (error) {
            console.warn('Hover error:', error);
            return null;
        }
    }

    /**
     * Comprehensive analysis
     */
    async analyze(text, tableName = null) {
        await this.initialize();
        if (!this.tools) return { hasErrors: false, hasWarnings: false };
        
        try {
            return this.tools.analyze(text, tableName);
        } catch (error) {
            console.warn('Analysis error:', error);
            return { hasErrors: false, hasWarnings: false };
        }
    }

    /**
     * Check if tools are ready
     */
    isReady() {
        return this.isLoaded && this.tools;
    }

    /**
     * Get current schema
     */
    get currentSchema() {
        return this.schema;
    }

    /**
     * Create fallback tools when loading fails
     */
    _createFallbackTools() {
        return {
            getCompletions: () => [],
            getDiagnostics: () => [],
            format: (text) => text,
            highlight: () => [],
            highlightToHTML: (text) => this._escapeHtml(text),
            getHover: () => null,
            analyze: () => ({ hasErrors: false, hasWarnings: false })
        };
    }

    /**
     * Escape HTML for fallback
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
window.developerToolsClient = new DeveloperToolsClient();