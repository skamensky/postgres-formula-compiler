/**
 * Browser-Based Formula Compiler Interface
 * Uses client-side modules for all processing - no server APIs needed!
 */

import { initializeBrowserAPI, executeFormula, getTables, getTableSchema, getDeveloperTools, updateDeveloperToolsSchema } from './modules/shared/browser-api.js';
import { getExamplesForTable, getAllExamples, getExampleStats } from './modules/shared/examples.js';
import { FUNCTION_METADATA } from './modules/compiler/function-metadata.js';

// =============================================================================
// APPLICATION STATE  
// =============================================================================

const AppState = {
    availableTables: [],
    currentTable: null,
    isInitialized: false,
    dbClient: null,
    developerTools: null
};

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    MAX_DISPLAY_ROWS: 50,
    VALIDATION_DEBOUNCE: 500,
    RECENT_FORMULAS_KEY: 'formula_recent_formulas'
};

// =============================================================================
// UTILITIES
// =============================================================================

const Utils = {
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    },

    generateUniqueId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// =============================================================================
// UI UTILITIES
// =============================================================================

const UI = {
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    showResult(elementId, result, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let html = '';
        
        if (type === 'success' && result.title) {
            html = `
                <div class="results success">
                    <h4>${result.title}</h4>
                    ${this.renderMetadata(result.metadata)}
                    ${this.renderSQL(result.sql)}
                    ${this.renderDataTable(result.results)}
                </div>
            `;
        } else if (type === 'success') {
            html = `
                <div class="results success">
                    <h4>✅ Formula executed successfully</h4>
                    ${result.sql ? this.renderSQL(result.sql) : ''}
                    ${result.results ? this.renderDataTable(result.results) : ''}
                </div>
            `;
        } else if (type === 'error') {
            html = `
                <div class="results error">
                    <h4>❌ Error</h4>
                    <p>${Utils.escapeHtml(typeof result === 'string' ? result : result.message || 'Unknown error')}</p>
                </div>
            `;
        }
        
        element.innerHTML = html;
    },

    renderMetadata(metadata) {
        if (!metadata) return '';
        
        return `
            <div class="metadata">
                ${Object.entries(metadata).map(([key, value]) => 
                    `<span class="metadata-item"><strong>${key}:</strong> ${value}</span>`
                ).join('')}
            </div>
        `;
    },

    renderSQL(sql) {
        if (!sql) return '';
        return `
            <div class="sql-section">
                <h5>Generated SQL:</h5>
                <pre class="sql-code">${Utils.escapeHtml(sql)}</pre>
            </div>
        `;
    },

    renderDataTable(data, maxRows = CONFIG.MAX_DISPLAY_ROWS) {
        if (!data || data.length === 0) {
            return '<p class="no-data">No data returned</p>';
        }

        const displayData = data.slice(0, maxRows);
        const columns = Object.keys(displayData[0]);
        
        let html = '<div class="data-table-container"><table class="data-table">';
        
        // Header
        html += '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${Utils.escapeHtml(col)}</th>`;
        });
        html += '</tr></thead>';
        
        // Body
        html += '<tbody>';
        displayData.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col];
                const displayValue = value === null ? 'null' : 
                                   value === undefined ? 'undefined' : 
                                   String(value);
                html += `<td>${Utils.escapeHtml(displayValue)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        
        if (data.length > maxRows) {
            html += `<p class="data-truncated">Showing ${maxRows} of ${data.length} rows</p>`;
        }
        
        return html;
    },

    setButtonState(buttonId, loading = false, text = null) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            if (text) button.textContent = text;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            if (text) button.textContent = text;
            button.classList.remove('loading');
        }
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }
};

// =============================================================================
// BROWSER INITIALIZATION
// =============================================================================

async function initializeBrowser() {
    try {
        console.log('🔌 Initializing browser-based compiler...');
        
        // Initialize browser API (database + developer tools)
        const { dbClient, developerTools } = await initializeBrowserAPI();
        
        AppState.dbClient = dbClient;
        AppState.developerTools = developerTools;
        AppState.isInitialized = true;
        
        console.log('✅ Browser compiler initialized');
        
        // Load tables
        await loadTables();
        
        // Initialize developer tools integration
        await setupDeveloperTools();
        
        console.log('🚀 Application ready!');
        
    } catch (error) {
        console.error('❌ Failed to initialize browser compiler:', error);
        
        // Show error to user
        document.getElementById('formulaResults').innerHTML = `
            <div class="results error">
                <h4>❌ Initialization Error</h4>
                <p>Failed to initialize the browser-based compiler: ${error.message}</p>
                <p>Please refresh the page and try again.</p>
            </div>
        `;
    }
}

// =============================================================================
// TABLES MANAGEMENT
// =============================================================================

async function loadTables() {
    try {
        const data = await getTables();
        AppState.availableTables = data.tables;
        populateTableSelectors();
        
        // Auto-select default table
        const defaultTable = AppState.availableTables.includes('customer') ? 
            'customer' : AppState.availableTables[0];
        
        if (defaultTable) {
            document.getElementById('tableSelect').value = defaultTable;
            const schemaTableSelect = document.getElementById('schemaTableSelect');
            if (schemaTableSelect) {
                schemaTableSelect.value = defaultTable;
            }
            AppState.currentTable = defaultTable;
        }
        
    } catch (error) {
        console.error('Error loading tables:', error);
        document.getElementById('tableSelect').innerHTML = 
            '<option value="">Error loading tables</option>';
    }
}

function populateTableSelectors() {
    const selectors = ['tableSelect', 'schemaTableSelect'];
    const options = {
        tableSelect: 'Select a table...',
        schemaTableSelect: 'Choose a table to view its schema'
    };
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (!selector) return;
        
        selector.innerHTML = `<option value="">${options[selectorId]}</option>`;
        AppState.availableTables.forEach(table => {
            const option = new Option(table, table);
            selector.appendChild(option);
        });
    });
}

// =============================================================================
// LIVE FORMULA EXECUTION
// =============================================================================

const LiveExecution = {
    enabled: true,
    debounceDelay: 800, // ms
    debounceTimer: null,
    lastFormula: '',
    lastTable: '',
    
    init() {
        this.setupEventListeners();
        this.updateUI();
    },
    
    setupEventListeners() {
        const formulaInput = document.getElementById('formulaInput');
        const toggleBtn = document.getElementById('toggleLiveBtn');
        
        // Live input listener
        formulaInput.addEventListener('input', (e) => {
            if (this.enabled) {
                this.handleInput(e.target.value);
            }
        });
        
        // Table change listener
        document.addEventListener('change', (e) => {
            if (e.target.id === 'tableSelect' && this.enabled) {
                // Get formula from Monaco editor if available, otherwise from textarea
                let formula;
                try {
                    if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                        formula = window.enhancedMonaco.editors.get('formulaInput').editor.getValue().trim();
                    } else if (window.formulaEditor && window.formulaEditor.editor) {
                        formula = window.formulaEditor.editor.getValue().trim();
                    } else {
                        formula = formulaInput.value.trim();
                    }
                } catch (error) {
                    console.warn('Failed to get Monaco editor value in table change, using textarea:', error);
                    formula = formulaInput.value.trim();
                }
                
                if (formula) {
                    this.handleInput(formula);
                }
            }
        });
        
        // Toggle button listener
        toggleBtn.addEventListener('mousedown', () => {
            // Force hide autocomplete dropdown to prevent interference
            if (window.autocomplete && window.autocomplete.isVisible) {
                window.autocomplete.hide();
            }
        });
        
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
    },
    
    handleInput(formula) {
        const tableName = document.getElementById('tableSelect').value;
        
        // Clear previous timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Update status to validating
        this.updateStatus('validating', 'Validating...');
        
        // Clear error display
        this.hideError();
        
        // Debounce execution
        this.debounceTimer = setTimeout(() => {
            this.validateAndExecute(formula, tableName);
        }, this.debounceDelay);
    },
    
    async validateAndExecute(formula, tableName) {
        // Skip if same as last execution
        if (formula === this.lastFormula && tableName === this.lastTable) {
            this.updateStatus('ready', 'Ready');
            return;
        }
        
        // Validate inputs
        if (!formula.trim()) {
            this.updateStatus('ready', 'Ready');
            document.getElementById('formulaResults').innerHTML = '';
            return;
        }
        
        if (!tableName) {
            this.showError('Please select a table first');
            this.updateStatus('error', 'No table');
            return;
        }
        
        // Validate formula syntax
        try {
            // Use frontend-only validation via developer tools
            const tools = getDeveloperTools();
            if (tools) {
                const diagnostics = tools.getDiagnostics(formula, tableName);
                const hasErrors = diagnostics.some(d => d.severity === 'error');
                
                if (hasErrors) {
                    const errorDiagnostic = diagnostics.find(d => d.severity === 'error');
                    this.showError(errorDiagnostic.message || 'Invalid formula syntax');
                    this.updateStatus('error', 'Invalid');
                    return;
                }
            }
        } catch (error) {
            this.showError(`Validation error: ${error.message}`);
            this.updateStatus('error', 'Error');
            return;
        }
        
        // Execute formula
        this.updateStatus('executing', 'Executing...');
        
        try {
            const result = await executeFormula(formula, tableName);
            
            if (result.success) {
                UI.showResult('formulaResults', result, 'success');
                this.updateStatus('success', 'Success');
                
                // Save to recent formulas (but less frequently to avoid spam)
                if (formula.length > 10) { // Only save substantial formulas
                    RecentFormulas.save(formula, tableName);
                }
                
                this.lastFormula = formula;
                this.lastTable = tableName;
            } else {
                this.showError(result.error);
                this.updateStatus('error', 'Failed');
            }
        } catch (error) {
            this.showError(`Execution error: ${error.message}`);
            this.updateStatus('error', 'Error');
        }
    },
    
    updateStatus(state, text) {
        const indicator = document.getElementById('statusIndicator');
        const icon = indicator.querySelector('.status-icon');
        const textEl = indicator.querySelector('.status-text');
        
        // Remove all state classes
        indicator.className = 'status-indicator';
        indicator.classList.add(state);
        
        // Update icon based on state
        const icons = {
            ready: '⚪',
            validating: '🟡',
            executing: '🔵',
            success: '🟢',
            error: '🔴'
        };
        
        icon.textContent = icons[state] || '⚪';
        textEl.textContent = text;
    },
    
    showError(message) {
        const errorEl = document.getElementById('formulaError');
        errorEl.innerHTML = `<strong>Error:</strong> ${Utils.escapeHtml(message)}`;
        errorEl.classList.remove('hidden');
    },
    
    hideError() {
        const errorEl = document.getElementById('formulaError');
        errorEl.classList.add('hidden');
    },
    
    toggle() {
        this.enabled = !this.enabled;
        this.updateUI();
        
        if (this.enabled) {
            // If enabling, trigger immediate validation if there's content
            // Get formula from Monaco editor if available, otherwise from textarea
            let formula;
            try {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                    formula = window.enhancedMonaco.editors.get('formulaInput').editor.getValue().trim();
                } else if (window.formulaEditor && window.formulaEditor.editor) {
                    formula = window.formulaEditor.editor.getValue().trim();
                } else {
                    formula = document.getElementById('formulaInput').value.trim();
                }
            } catch (error) {
                console.warn('Failed to get Monaco editor value in toggle, using textarea:', error);
                formula = document.getElementById('formulaInput').value.trim();
            }
            
            if (formula) {
                this.handleInput(formula);
            }
        } else {
            // If disabling, clear timers and reset status
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.updateStatus('ready', 'Manual mode');
        }
    },
    
    updateUI() {
        const toggleBtn = document.getElementById('toggleLiveBtn');
        const executeBtn = document.getElementById('executeBtn');
        
        if (this.enabled) {
            toggleBtn.textContent = 'Live Mode: ON';
            toggleBtn.classList.remove('live-off');
            executeBtn.style.display = 'none';
            this.updateStatus('ready', 'Ready');
        } else {
            toggleBtn.textContent = 'Live Mode: OFF';
            toggleBtn.classList.add('live-off');
            executeBtn.style.display = 'inline-block';
            this.updateStatus('ready', 'Manual mode');
        }
    }
};

// =============================================================================
// FORMULA COMPILER (Enhanced for live execution)
// =============================================================================

const FormulaCompiler = {
    async execute() {
        // Get formula from Monaco editor if available, otherwise fallback to textarea
        let formula;
        try {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                formula = window.enhancedMonaco.editors.get('formulaInput').editor.getValue().trim();
            } else if (window.formulaEditor && window.formulaEditor.editor) {
                formula = window.formulaEditor.editor.getValue().trim();
            } else {
                // Fallback to regular textarea
                formula = document.getElementById('formulaInput').value.trim();
            }
        } catch (error) {
            console.warn('Failed to get Monaco editor value, using textarea fallback:', error);
            formula = document.getElementById('formulaInput').value.trim();
        }
        
        const tableName = document.getElementById('tableSelect').value;
        
        if (!formula) {
            UI.showResult('formulaResults', 'Please enter a formula', 'error');
            return;
        }
        
        if (!tableName) {
            UI.showResult('formulaResults', 'Please select a table', 'error');
            return;
        }
        
        UI.setButtonState('executeBtn', true, 'Executing...');
        
        try {
            const result = await executeFormula(formula, tableName);
            
            if (result.success) {
                UI.showResult('formulaResults', result, 'success');
                
                // Save to recent formulas
                RecentFormulas.save(formula, tableName);
            } else {
                UI.showResult('formulaResults', result.error, 'error');
            }
        } catch (error) {
            UI.showResult('formulaResults', `Network error: ${error.message}`, 'error');
        } finally {
            UI.setButtonState('executeBtn', false, 'Execute Formula');
        }
    },

    clear() {
        // Clear formula in Monaco editor if available, otherwise fallback to textarea
        try {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                window.enhancedMonaco.editors.get('formulaInput').editor.setValue('');
            } else if (window.formulaEditor && window.formulaEditor.editor) {
                window.formulaEditor.editor.setValue('');
            } else {
                // Fallback to regular textarea
                document.getElementById('formulaInput').value = '';
            }
        } catch (error) {
            console.warn('Failed to clear Monaco editor, using textarea fallback:', error);
            document.getElementById('formulaInput').value = '';
        }
        
        document.getElementById('formulaResults').innerHTML = '';
        
        // Clear live execution state
        LiveExecution.lastFormula = '';
        LiveExecution.lastTable = '';
        LiveExecution.hideError();
        LiveExecution.updateStatus('ready', 'Ready');
    }
};

// =============================================================================
// RECENT FORMULAS
// =============================================================================

const RecentFormulas = {
    save(formula, tableName) {
        const recent = this.load();
        const newEntry = {
            id: Utils.generateUniqueId(),
            formula: formula,
            tableName: tableName,
            timestamp: new Date().toISOString()
        };
        
        // Remove duplicates and add to front
        const filtered = recent.filter(item => 
            item.formula !== formula || item.tableName !== tableName
        );
        const updated = [newEntry, ...filtered].slice(0, 10); // Keep only 10
        
        localStorage.setItem(CONFIG.RECENT_FORMULAS_KEY, JSON.stringify(updated));
        this.render();
    },

    load() {
        try {
            const stored = localStorage.getItem(CONFIG.RECENT_FORMULAS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            return [];
        }
    },

    render() {
        const container = document.getElementById('recentFormulas');
        if (!container) return;
        
        const recent = this.load();
        
        if (recent.length === 0) {
            container.innerHTML = '<p class="no-recent">No recent formulas</p>';
            return;
        }
        
        const html = recent.map(item => `
            <div class="recent-formula" onclick="RecentFormulas.loadFormula('${item.id}')">
                <div class="recent-formula-text">${Utils.escapeHtml(item.formula)}</div>
                <div class="recent-formula-meta">
                    ${item.tableName} • ${Utils.formatTimeAgo(new Date(item.timestamp))}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },

    loadFormula(id) {
        const recent = this.load();
        const formula = recent.find(item => item.id === id);
        
        if (formula) {
            // Set formula in Monaco editor if available, otherwise fallback to textarea
            try {
                if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                    window.enhancedMonaco.editors.get('formulaInput').editor.setValue(formula.formula);
                } else if (window.formulaEditor && window.formulaEditor.editor) {
                    window.formulaEditor.editor.setValue(formula.formula);
                } else {
                    // Fallback to regular textarea
                    document.getElementById('formulaInput').value = formula.formula;
                }
            } catch (error) {
                console.warn('Failed to set Monaco editor value, using textarea fallback:', error);
                document.getElementById('formulaInput').value = formula.formula;
            }
            
            document.getElementById('tableSelect').value = formula.tableName;
            AppState.currentTable = formula.tableName;
            
            // Update table context for Monaco editor
            if (window.enhancedMonaco) {
                try {
                    window.enhancedMonaco.setTableContext('formulaInput', formula.tableName);
                } catch (error) {
                    console.warn('Failed to update Monaco table context:', error);
                }
            }
            
            UI.switchTab('compiler');
        }
    }
};

// =============================================================================
// DEVELOPER TOOLS INTEGRATION 
// =============================================================================

async function createMonacoEditorWithRetry() {
    const maxRetries = 10;
    let retries = 0;
    
    while (retries < maxRetries) {
        if (window.enhancedMonaco && window.enhancedMonaco.createEditor) {
            try {
                const editor = window.enhancedMonaco.createEditor('formulaInput');
                if (editor) {
                    console.log('✅ Monaco editor created successfully');
                    
                    // Store global reference for backward compatibility
                    window.formulaEditor = editor;
                    
                    // Set up table context - use currently selected table
                    const currentTable = AppState.currentTable || document.getElementById('tableSelect')?.value;
                    if (currentTable) {
                        console.log(`🔧 Setting Monaco editor table context to: ${currentTable}`);
                        if (editor.setTableContext) {
                            editor.setTableContext(currentTable);
                        } else {
                            // Fallback: set it directly on the editor info
                            const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
                            if (editorInfo) {
                                editorInfo.currentTable = currentTable;
                                console.log('✅ Table context set via fallback method');
                            }
                        }
                    } else {
                        console.warn('⚠️ No current table available for Monaco editor context');
                    }
                    return editor;
                } else {
                    console.warn(`⚠️ Failed to create Monaco editor (attempt ${retries + 1})`);
                }
            } catch (error) {
                console.warn(`⚠️ Monaco editor creation error (attempt ${retries + 1}):`, error);
            }
        } else {
            console.log(`⏳ Waiting for Enhanced Monaco to be available (attempt ${retries + 1}/${maxRetries})...`);
        }
        
        retries++;
        if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.warn('⚠️ Enhanced Monaco not available after maximum retries - continuing without Monaco editor');
    return null;
}

async function setupDeveloperTools() {
    console.log('🔧 Setting up developer tools integration...');
    
    try {
        // Expose function metadata globally for autocomplete and LSP features
        window.FUNCTION_METADATA = FUNCTION_METADATA;
        console.log('✅ Function metadata exposed globally:', Object.keys(FUNCTION_METADATA).length, 'functions');
        
        // Initialize developer tools client
        if (window.developerToolsClient) {
            await window.developerToolsClient.initialize();
            console.log('✅ Developer tools loaded successfully');
            
            // Set up schema when tables are loaded
            if (AppState.availableTables.length > 0) {
                await updateSchemaForDeveloperTools();
            }
        }
        
        // Create Monaco editor for formula input with retry logic
        console.log('🔧 Creating Monaco editor for formula input...');
        await createMonacoEditorWithRetry();
        
        // Initialize UI enhancements with a short delay to allow Monaco to settle
        setTimeout(() => {
            console.log('🎨 Initializing UI enhancements...');
            setupUIEnhancements();
        }, 500);
        
        console.log('✅ Developer tools ready');
        
    } catch (error) {
        console.error('❌ Developer tools setup failed:', error);
        // Continue anyway, app should still work without developer tools
    }
}

async function initializeUIEnhancements() {
    try {
        console.log('🎨 Initializing UI enhancements...');
        
        // Wait for UI enhancement modules to be available
        let retries = 0;
        while ((!window.autocomplete || !window.syntaxHighlighting || !window.formatterIntegration) && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (retries >= 20) {
            console.warn('⚠️ UI enhancement modules not available after waiting');
            return;
        }
        
        // Get formula input element
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput) {
            console.log('🎨 Enhancing formula input...');
            
            // Attach autocomplete
            if (window.autocomplete) {
                window.autocomplete.attachTo(formulaInput, AppState.currentTable);
                console.log('💭 Autocomplete attached');
            }
            
            // Attach syntax highlighting
            if (window.syntaxHighlighting) {
                window.syntaxHighlighting.attachTo(formulaInput, AppState.currentTable);
                console.log('🎨 Syntax highlighting attached');
            }
            
            // Attach formatter with button
            if (window.formatterIntegration) {
                const buttonGroup = document.querySelector('.button-group');
                if (buttonGroup) {
                    window.formatterIntegration.addToButtonGroup(buttonGroup, formulaInput, {
                        text: 'Format',
                        className: 'btn btn-secondary'
                    });
                    console.log('📐 Format button added');
                } else {
                    // Fallback to inline button
                    window.formatterIntegration.attachTo(formulaInput, {
                        buttonPosition: 'after',
                        buttonText: 'Format'
                    });
                    console.log('📐 Formatter attached with inline button');
                }
            }
            
            console.log('✅ Formula input enhanced with all tools');
        } else {
            console.warn('⚠️ Formula input element not found');
        }
        
        // Set up dynamic enhancement for new inputs
        setupDynamicEnhancement();
        
    } catch (error) {
        console.warn('⚠️ UI enhancement initialization failed:', error);
    }
}

function setupDynamicEnhancement() {
    // Use MutationObserver to enhance new formula inputs
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if this is a formula input or contains formula inputs
                    const inputs = node.matches?.('textarea, input[type="text"]') ? [node] : 
                                  Array.from(node.querySelectorAll?.('textarea, input[type="text"]') || []);
                    
                    inputs.forEach(input => {
                        // Only enhance if it looks like a formula input and isn't already enhanced
                        if ((input.id?.includes('formula') || input.className?.includes('formula') || 
                             input.placeholder?.toLowerCase().includes('formula')) &&
                            !input.hasAttribute('data-enhanced')) {
                            
                            console.log('🎨 Auto-enhancing new formula input:', input.id || input.className);
                            enhanceFormulaInput(input);
                        }
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function enhanceFormulaInput(input, tableName = null) {
    // Mark as enhanced to prevent double-enhancement
    input.setAttribute('data-enhanced', 'true');
    
    const currentTable = tableName || AppState.currentTable;
    
    try {
        // Attach all available tools
        if (window.autocomplete) {
            window.autocomplete.attachTo(input, currentTable);
        }
        
        if (window.syntaxHighlighting) {
            window.syntaxHighlighting.attachTo(input, currentTable);
        }
        
        if (window.formatterIntegration) {
            window.formatterIntegration.attachTo(input, {
                buttonPosition: 'after',
                showButton: true
            });
        }
        
        console.log('✅ Enhanced formula input:', input.id || input.className);
        
    } catch (error) {
        console.warn('⚠️ Failed to enhance formula input:', error);
    }
}

async function updateSchemaForDeveloperTools() {
    try {
        // Build schema in the format expected by LSP: schema[tableName] directly
        const lspSchema = {};
        
        // Fetch detailed schema for each table
        for (const tableName of AppState.availableTables) {
            const tableData = await getTableSchema(tableName);
            
            lspSchema[tableName] = {
                columns: tableData.columns || [],
                directRelationships: tableData.directRelationships || [],
                reverseRelationships: tableData.reverseRelationships || []
            };
        }
        
        console.log('🔧 Schema built for developer tools:', Object.keys(lspSchema));
        
        // Update developer tools with schema using client
        if (window.developerToolsClient) {
            window.developerToolsClient.updateSchema(lspSchema);
        }
        
        // Also build legacy format for other tools that might need it
        const legacySchema = { 
            tables: lspSchema, 
            relationships: []
        };
        
        // Collect all relationships
        Object.values(lspSchema).forEach(table => {
            legacySchema.relationships.push(...(table.directRelationships || []));
        });
        
        // Update individual UI tools with legacy schema format
        if (window.autocomplete) {
            window.autocomplete.updateSchema(legacySchema);
        }
        
        if (window.syntaxHighlighting) {
            window.syntaxHighlighting.updateSchema(legacySchema);
        }
        
    } catch (error) {
        console.warn('Failed to update developer tools schema:', error);
    }
}

// =============================================================================
// EVENT LISTENERS AND INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting browser-based Formula Compiler...');
    
    // Initialize browser-based system
    await initializeBrowser();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize live execution
    LiveExecution.init();
    
    // Initialize UI components
    RecentFormulas.render();
    
    console.log('✅ Application fully loaded');
});

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            UI.switchTab(tabName);
            
            // Load tab-specific data
            if (tabName === 'examples') {
                loadExamples();
            } else if (tabName === 'schema') {
                // Load schema details if a table is already selected
                const schemaTableSelect = document.getElementById('schemaTableSelect');
                if (schemaTableSelect && schemaTableSelect.value) {
                    loadSchemaDetails(schemaTableSelect.value);
                }
            }
        });
    });

    // Formula compiler
    document.getElementById('executeBtn').addEventListener('click', FormulaCompiler.execute);
    document.getElementById('clearBtn').addEventListener('click', FormulaCompiler.clear);
    
    // Table selection
    document.getElementById('tableSelect').addEventListener('change', (e) => {
        AppState.currentTable = e.target.value;
        
        // Also sync schema table selector
        const schemaTableSelect = document.getElementById('schemaTableSelect');
        if (schemaTableSelect) {
            schemaTableSelect.value = e.target.value;
        }
        
        // Update UI enhancements with new table context
        updateUIEnhancementsForTable(e.target.value);
        
        // Refresh examples if on examples tab
        const examplesTab = document.getElementById('examples');
        if (examplesTab && examplesTab.classList.contains('active')) {
            loadExamples();
        }
    });
    
    // Schema table selection
    document.getElementById('schemaTableSelect').addEventListener('change', (e) => {
        loadSchemaDetails(e.target.value);
        
        // Also sync main table selector
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect) {
            tableSelect.value = e.target.value;
            AppState.currentTable = e.target.value;
        }
    });
    
    // Formula input - Enter key handling (only in manual mode)
    document.getElementById('formulaInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            if (!LiveExecution.enabled) {
                FormulaCompiler.execute();
            } else {
                // In live mode, Enter triggers immediate execution
                // Get formula from Monaco editor if available, otherwise from textarea
                let formula;
                try {
                    if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                        formula = window.enhancedMonaco.editors.get('formulaInput').editor.getValue().trim();
                    } else if (window.formulaEditor && window.formulaEditor.editor) {
                        formula = window.formulaEditor.editor.getValue().trim();
                    } else {
                        formula = e.target.value.trim();
                    }
                } catch (error) {
                    console.warn('Failed to get Monaco editor value in keydown, using textarea:', error);
                    formula = e.target.value.trim();
                }
                
                if (formula) {
                    LiveExecution.validateAndExecute(formula, document.getElementById('tableSelect').value);
                }
            }
        }
    });
}

// =============================================================================
// SCHEMA BROWSER
// =============================================================================

async function loadSchemaDetails(tableName) {
    const schemaDetailsElement = document.getElementById('schemaDetails');
    
    if (!tableName) {
        schemaDetailsElement.innerHTML = '<p class="loading">Select a table to view its schema and sample data</p>';
        return;
    }
    
    UI.showLoading('schemaDetails', `Loading schema for ${tableName}...`);
    
    try {
        const schema = await getTableSchema(tableName);
        displaySchemaDetails(tableName, schema);
    } catch (error) {
        console.error('Error loading schema:', error);
        schemaDetailsElement.innerHTML = `
            <div class="results error">
                <h4>❌ Error Loading Schema</h4>
                <p>Failed to load schema for table "${tableName}": ${error.message}</p>
            </div>
        `;
    }
}

function displaySchemaDetails(tableName, schema) {
    const schemaDetailsElement = document.getElementById('schemaDetails');
    
    let html = `
        <div class="schema-display">
            <h3>📋 ${tableName} Schema</h3>
    `;
    
    // Columns section
    if (schema.columns && schema.columns.length > 0) {
        html += `
            <div class="schema-section">
                <h4>🏛️ Columns (${schema.columns.length})</h4>
                <div class="columns-grid">
        `;
        
        schema.columns.forEach(col => {
            const nullable = col.nullable ? '?' : '!';
            const defaultValue = col.default_value ? ` = ${col.default_value}` : '';
            html += `
                <div class="column-item">
                    <strong>${col.column_name}</strong><span class="column-type">${col.data_type}${nullable}</span>
                    ${col.comment ? `<div class="column-comment">${col.comment}</div>` : ''}
                    ${defaultValue ? `<div class="column-default">${defaultValue}</div>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Direct relationships section
    if (schema.directRelationships && schema.directRelationships.length > 0) {
        html += `
            <div class="schema-section">
                <h4>🔗 Direct Relationships (${schema.directRelationships.length})</h4>
                <div class="relationships-list">
        `;
        
        schema.directRelationships.forEach(rel => {
            html += `
                <div class="relationship-item">
                    <strong>${rel.relationship_name}</strong> → 
                    <span class="clickable-table" onclick="navigateToTable('${rel.target_table_name}')" 
                          title="Click to view ${rel.target_table_name} schema">${rel.target_table_name}</span>
                    <div class="relationship-detail">via ${rel.col_name}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Reverse relationships section
    if (schema.reverseRelationships && schema.reverseRelationships.length > 0) {
        html += `
            <div class="schema-section">
                <h4>🔙 Reverse Relationships (${schema.reverseRelationships.length})</h4>
                <div class="relationships-list">
        `;
        
        schema.reverseRelationships.forEach(rel => {
            html += `
                <div class="relationship-item">
                    <strong>${rel.relationship_name}</strong> ← 
                    <span class="clickable-table" onclick="navigateToTable('${rel.source_table_name}')" 
                          title="Click to view ${rel.source_table_name} schema">${rel.source_table_name}</span>
                    <div class="relationship-detail">via ${rel.col_name}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Sample data section
    if (schema.sampleData && schema.sampleData.length > 0) {
        html += `
            <div class="schema-section">
                <h4>📊 Sample Data (${schema.sampleData.length} rows)</h4>
                ${UI.renderDataTable(schema.sampleData, 5)}
            </div>
        `;
    }
    
    html += `</div>`;
    
    schemaDetailsElement.innerHTML = html;
}

/**
 * Navigate to a related table in the schema viewer
 * @param {string} tableName - The table name to navigate to
 */
function navigateToTable(tableName) {
    console.log(`🔗 Navigating to table: ${tableName}`);
    
    // Update the schema table selector
    const schemaTableSelect = document.getElementById('schemaTableSelect');
    if (schemaTableSelect) {
        schemaTableSelect.value = tableName;
    }
    
    // Also update the main table selector to keep them in sync
    const tableSelect = document.getElementById('tableSelect');
    if (tableSelect) {
        tableSelect.value = tableName;
        AppState.currentTable = tableName;
    }
    
    // Load the schema details for the new table
    loadSchemaDetails(tableName);
    
    // Update UI enhancements for the new table context
    updateUIEnhancementsForTable(tableName);
    
    // Visual feedback - briefly highlight the table name change
    if (schemaTableSelect) {
        schemaTableSelect.style.backgroundColor = '#e3f2fd';
        setTimeout(() => {
            schemaTableSelect.style.backgroundColor = '';
        }, 1000);
    }
}

// =============================================================================
// EXAMPLES (CLIENT-SIDE)
// =============================================================================

async function loadExamples() {
    const examplesList = document.getElementById('examplesList');
    if (!examplesList) return;
    
    try {
        const currentTable = AppState.currentTable;
        const stats = getExampleStats();
        
        let html = `
            <div class="examples-container">
                <div class="examples-header">
                    <h3>📝 Formula Examples</h3>
                    <p>Click any example to auto-execute in the compiler!</p>
                    <div class="examples-stats">
                        <span class="stat-item">📊 ${stats.totalExamples} total examples</span>
                        <span class="stat-item">🗃️ ${stats.tableCount} tables</span>
                    </div>
                </div>
        `;
        
        // Show table filter if a table is selected
        if (currentTable) {
            const tableExamples = getExamplesForTable(currentTable);
            if (tableExamples.length > 0) {
                html += `
                    <div class="examples-section">
                        <h4>🎯 ${currentTable} Examples (${tableExamples.length})</h4>
                        <div class="examples-grid">
                `;
                
                tableExamples.forEach(example => {
                    html += createExampleCard(example, true);
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        }
        
        // Show all examples organized by table
        html += `
            <div class="examples-section">
                <h4>📚 All Examples by Table</h4>
                <div class="examples-accordion">
        `;
        
        for (const tableName in stats.byTable) {
            const tableExamples = getExamplesForTable(tableName);
            const isCurrentTable = tableName === currentTable;
            
            html += `
                <div class="examples-table-group ${isCurrentTable ? 'current-table' : ''}">
                    <div class="examples-table-header" onclick="toggleTableExamples('${tableName}')">
                        <span class="table-name">${tableName}</span>
                        <span class="table-count">${tableExamples.length} examples</span>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div class="examples-table-content" id="examples-${tableName}">
                        <div class="examples-grid">
            `;
            
            tableExamples.forEach(example => {
                html += createExampleCard(example, false);
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
            </div>
        `;
        
        examplesList.innerHTML = html;
        
        // Auto-expand current table if one is selected
        if (currentTable) {
            const currentTableContent = document.getElementById(`examples-${currentTable}`);
            if (currentTableContent) {
                currentTableContent.style.display = 'block';
            }
        }
        
    } catch (error) {
        console.error('Error loading examples:', error);
        examplesList.innerHTML = `
            <div class="examples-error">
                <h3>❌ Error Loading Examples</h3>
                <p>Could not load formula examples: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Create HTML for an example card
 */
function createExampleCard(example, isHighlighted = false) {
    const shortFormula = example.formula.length > 100 
        ? example.formula.substring(0, 100) + '...' 
        : example.formula;
    
    return `
        <div class="example-card ${isHighlighted ? 'highlighted' : ''}" 
             onclick="loadAndExecuteExample('${example.id}')">
            <div class="example-header">
                <h5 class="example-title">${example.title}</h5>
                <span class="example-table">${example.tableName}</span>
            </div>
            <div class="example-description">${example.description}</div>
            <div class="example-formula">
                <code>${shortFormula}</code>
            </div>
            <div class="example-actions">
                <span class="example-action">🖱️ Click to execute</span>
            </div>
        </div>
    `;
}

/**
 * Toggle visibility of examples for a table
 */
function toggleTableExamples(tableName) {
    const content = document.getElementById(`examples-${tableName}`);
    const header = content?.previousElementSibling;
    const icon = header?.querySelector('.toggle-icon');
    
    if (content && icon) {
        const isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        icon.textContent = isVisible ? '▼' : '▲';
    }
}

/**
 * Load an example into the compiler and execute it
 */
async function loadAndExecuteExample(exampleId) {
    try {
        // Import the example getter function dynamically
        const { getExampleById } = await import('./modules/shared/examples.js');
        const example = getExampleById(exampleId);
        
        if (!example) {
            console.error('Example not found:', exampleId);
            return;
        }
        
        console.log(`🚀 Loading example: ${example.title}`);
        
        // Switch to compiler tab
        UI.switchTab('compiler');
        
        // Set the table
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect) {
            tableSelect.value = example.tableName;
            AppState.currentTable = example.tableName;
        }
        
        // Set the formula in Monaco editor if available, otherwise fallback to textarea
        try {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                window.enhancedMonaco.editors.get('formulaInput').editor.setValue(example.formula);
                console.log('📝 Example loaded into Monaco editor:', example.formula);
            } else if (window.formulaEditor && window.formulaEditor.editor) {
                window.formulaEditor.editor.setValue(example.formula);
                console.log('📝 Example loaded into formula editor:', example.formula);
            } else {
                // Fallback to regular textarea
                const formulaInput = document.getElementById('formulaInput');
                if (formulaInput) {
                    formulaInput.value = example.formula;
                    console.log('📝 Example loaded into textarea (fallback):', example.formula);
                }
            }
        } catch (error) {
            console.warn('Failed to set Monaco editor value, using textarea fallback:', error);
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                formulaInput.value = example.formula;
            }
        }
        
        // Update table context for Monaco editor
        if (window.enhancedMonaco) {
            try {
                window.enhancedMonaco.setTableContext('formulaInput', example.tableName);
                console.log('📊 Monaco table context updated to:', example.tableName);
            } catch (error) {
                console.warn('Failed to update Monaco table context:', error);
            }
        }
        
        // Clear any previous error states before executing
        LiveExecution.hideError();
        LiveExecution.updateStatus('ready', 'Ready');
        
        // Clear previous results
        const resultsElement = document.getElementById('formulaResults');
        if (resultsElement) {
            resultsElement.innerHTML = '';
        }
        
        // Wait a moment for UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Execute the formula
        await FormulaCompiler.execute();
        
        console.log(`✅ Example executed: ${example.title}`);
        
    } catch (error) {
        console.error('Error loading example:', error);
        UI.showResult('formulaResults', `Error loading example: ${error.message}`, 'error');
    }
}

// =============================================================================
// MAKE GLOBAL FOR HTML EVENT HANDLERS
// =============================================================================

window.FormulaCompiler = FormulaCompiler;
window.RecentFormulas = RecentFormulas;
window.UI = UI;
window.loadSchemaDetails = loadSchemaDetails;
window.navigateToTable = navigateToTable;
window.toggleTableExamples = toggleTableExamples;
window.loadAndExecuteExample = loadAndExecuteExample;

function updateUIEnhancementsForTable(tableName) {
    try {
        // Update Monaco editor table context
        if (window.enhancedMonaco && window.enhancedMonaco.editors.size > 0) {
            const editorInfo = Array.from(window.enhancedMonaco.editors.values())[0];
            if (editorInfo) {
                editorInfo.currentTable = tableName;
                console.log(`🔧 Monaco editor table context updated to: ${tableName}`);
                
                // Also update via setTableContext if available
                if (editorInfo.editor && editorInfo.editor.setTableContext) {
                    editorInfo.editor.setTableContext(tableName);
                }
            }
        }
        
        // Update autocomplete with new table context
        if (window.autocomplete) {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                // Reattach with new table name
                window.autocomplete.attachTo(formulaInput, tableName);
            }
        }
        
        // Update syntax highlighting with new table context
        if (window.syntaxHighlighting) {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                // Update table name and re-highlight
                const data = window.syntaxHighlighting.highlightedElements.get(formulaInput);
                if (data) {
                    data.tableName = tableName;
                    window.syntaxHighlighting.updateHighlighting(formulaInput, tableName);
                }
            }
        }
        
        console.log(`🔄 UI enhancements updated for table: ${tableName}`);
        
    } catch (error) {
        console.warn('⚠️ Failed to update UI enhancements for table:', error);
    }
}

// Make enhanceFormulaInput globally available
window.enhanceFormulaInput = enhanceFormulaInput;

// =============================================================================
// EXPOSE API FUNCTIONS TO GLOBAL WINDOW FOR EXTERNAL ACCESS
// =============================================================================

// Expose browser API functions for Playwright tests and external access
window.initializeBrowserAPI = initializeBrowserAPI;
window.executeFormula = executeFormula;
window.getTables = getTables;
window.getTableSchema = getTableSchema;
window.getDeveloperTools = getDeveloperTools;
window.updateDeveloperToolsSchema = updateDeveloperToolsSchema;

function setupUIEnhancements() {
    try {
        // Set up dynamic formula input enhancement
        setupDynamicEnhancement();
        
        // Enhance existing formula inputs
        const formulaInputs = document.querySelectorAll('textarea[id*="formula"], input[id*="formula"]');
        formulaInputs.forEach(input => {
            if (!input.getAttribute('data-enhanced')) {
                enhanceFormulaInput(input, AppState.currentTable);
            }
        });
        
        console.log('🎨 UI enhancements ready');
    } catch (error) {
        console.warn('⚠️ UI enhancement modules not available after waiting');
    }
}