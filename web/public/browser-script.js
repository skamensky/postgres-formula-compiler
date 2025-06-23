/**
 * Browser-Based Formula Compiler Interface
 * Uses client-side modules for all processing - no server APIs needed!
 */

import { initializeBrowserAPI, executeFormula, executeMultipleFormulas, getTables, getTableSchema, validateFormula, getDeveloperTools, updateDeveloperToolsSchema } from './modules/shared/browser-api.js';
import { getExamplesForTable, getAllExamples, getExampleStats } from './modules/shared/examples.js';

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
        await initializeDeveloperToolsIntegration();
        
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
    const selectors = ['tableSelect', 'schemaTableSelect', 'reportTableSelect'];
    const options = {
        tableSelect: 'Select a table...',
        schemaTableSelect: 'Choose a table to view its schema',
        reportTableSelect: 'Select a table for the report...'
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
                const formula = formulaInput.value.trim();
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
            const validation = await validateFormula(formula, tableName);
            if (!validation.valid) {
                this.showError(validation.error || 'Invalid formula syntax');
                this.updateStatus('error', 'Invalid');
                return;
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
            const formula = document.getElementById('formulaInput').value.trim();
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
        const formula = document.getElementById('formulaInput').value.trim();
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
        document.getElementById('formulaInput').value = '';
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
        const item = {
            id: Utils.generateUniqueId(),
            formula: formula,
            tableName: tableName,
            timestamp: Date.now()
        };
        
        // Load existing items
        const existing = this.load();
        existing.unshift(item);
        
        // Keep only the most recent items
        const maxItems = 10;
        const trimmed = existing.slice(0, maxItems);
        
        // Save back to localStorage
        localStorage.setItem(CONFIG.RECENT_FORMULAS_KEY, JSON.stringify(trimmed));
        
        // Re-render
        this.render();
    },
    
    load() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.RECENT_FORMULAS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },
    
    render() {
        const container = document.getElementById('recentFormulas');
        if (!container) return;
        
        const items = this.load();
        
        if (items.length === 0) {
            container.innerHTML = '<p class="loading">No recent formulas yet</p>';
            return;
        }
        
        const html = items.map(item => `
            <div class="recent-formula" onclick="RecentFormulas.loadFormula('${item.id}')">
                <div class="recent-meta">
                    <strong>${item.tableName}</strong> • ${Utils.formatTimeAgo(new Date(item.timestamp))}
                </div>
                <div class="formula-preview">${Utils.escapeHtml(item.formula)}</div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },
    
    loadFormula(id) {
        const items = this.load();
        const item = items.find(f => f.id === id);
        if (!item) return;
        
        // Update table selector
        document.getElementById('tableSelect').value = item.tableName;
        AppState.currentTable = item.tableName;
        
        // Load formula
        document.getElementById('formulaInput').value = item.formula;
        
        // Switch to compiler tab
        UI.switchTab('compiler');
    }
};

// =============================================================================
// REPORT BUILDER
// =============================================================================

const ReportBuilder = {
    formulaRowCounter: 0,
    initialized: false,
    
    init() {
        this.setupEventListeners();
        this.addFormulaRow(); // Start with one empty row
        this.loadSavedReports();
        this.initialized = true;
    },
    
    setupEventListeners() {
        // Add formula row button
        document.getElementById('addFormulaBtn').addEventListener('click', () => {
            this.addFormulaRow();
        });
        
        // Execute report button
        document.getElementById('executeReportBtn').addEventListener('click', () => {
            this.executeReport();
        });
        
        // Clear report button
        document.getElementById('clearReportBtn').addEventListener('click', () => {
            this.clearReport();
        });
        
        // Save report button
        document.getElementById('saveReportBtn').addEventListener('click', () => {
            this.saveReport();
        });
        
        // Load example report button
        document.getElementById('loadExampleReportBtn').addEventListener('click', () => {
            this.loadExampleReport();
        });
        
        // Sync report table selector with main table selector
        document.getElementById('reportTableSelect').addEventListener('change', (e) => {
            AppState.currentTable = e.target.value;
            
            // Sync other table selectors
            const tableSelect = document.getElementById('tableSelect');
            if (tableSelect) {
                tableSelect.value = e.target.value;
            }
            const schemaTableSelect = document.getElementById('schemaTableSelect');
            if (schemaTableSelect) {
                schemaTableSelect.value = e.target.value;
            }
            
            // Update UI enhancements
            this.updateFormulaInputsEnhancement(e.target.value);
        });
    },
    
    addFormulaRow() {
        const formulaBuilder = document.getElementById('formulaBuilder');
        this.formulaRowCounter++;
        
        const rowId = `formula-row-${this.formulaRowCounter}`;
        const nameId = `formula-name-${this.formulaRowCounter}`;
        const inputId = `formula-input-${this.formulaRowCounter}`;
        
        const row = document.createElement('div');
        row.className = 'formula-row';
        row.id = rowId;
        row.innerHTML = `
            <input type="text" class="formula-name" id="${nameId}" placeholder="Column Name" value="Column_${this.formulaRowCounter}" />
            <textarea class="formula-input" id="${inputId}" placeholder="Enter formula..." rows="2"></textarea>
            <button type="button" class="btn-remove" onclick="ReportBuilder.removeFormulaRow('${rowId}')" title="Remove Formula">×</button>
        `;
        
        formulaBuilder.appendChild(row);
        
        // Enhance the new formula input with developer tools
        const formulaInput = document.getElementById(inputId);
        if (formulaInput) {
            // Add validation on input
            formulaInput.addEventListener('input', () => {
                this.validateFormulaInput(formulaInput);
            });
            
            // Enhance with developer tools if available
            setTimeout(() => {
                enhanceFormulaInput(formulaInput, AppState.currentTable);
            }, 100);
        }
    },
    
    removeFormulaRow(rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
        }
        
        // Ensure at least one row remains
        const formulaBuilder = document.getElementById('formulaBuilder');
        if (formulaBuilder.children.length === 0) {
            this.addFormulaRow();
        }
    },
    
    async validateFormulaInput(input) {
        const formula = input.value.trim();
        const tableName = document.getElementById('reportTableSelect').value;
        
        if (!formula || !tableName) {
            input.classList.remove('error', 'success');
            return;
        }
        
        try {
            const result = await validateFormula(formula, tableName);
            if (result.valid) {
                input.classList.remove('error');
                input.classList.add('success');
            } else {
                input.classList.remove('success');
                input.classList.add('error');
                input.title = result.error || 'Invalid formula';
            }
        } catch (error) {
            input.classList.remove('success');
            input.classList.add('error');
            input.title = error.message;
        }
    },
    
    async executeReport() {
        const tableName = document.getElementById('reportTableSelect').value;
        const reportName = document.getElementById('reportName').value.trim() || 'Unnamed Report';
        const formulaRows = document.querySelectorAll('#formulaBuilder .formula-row');
        
        if (!tableName) {
            UI.showResult('reportResults', 'Please select a table', 'error');
            return;
        }
        
        if (formulaRows.length === 0) {
            UI.showResult('reportResults', 'Please add at least one formula', 'error');
            return;
        }
        
        const formulas = [];
        let hasErrors = false;
        
        formulaRows.forEach((row, index) => {
            const nameInput = row.querySelector('.formula-name');
            const formulaInput = row.querySelector('.formula-input');
            
            const name = nameInput.value.trim() || `Column_${index + 1}`;
            const formula = formulaInput.value.trim();
            
            if (!formula) {
                hasErrors = true;
                formulaInput.classList.add('error');
                return;
            }
            
            formulas.push({ name, formula });
        });
        
        if (hasErrors || formulas.length === 0) {
            UI.showResult('reportResults', 'Please fill in all formulas', 'error');
            return;
        }
        
        UI.setButtonState('executeReportBtn', true, 'Generating Report...');
        
        try {
            const result = await executeMultipleFormulas(formulas, tableName);
            
            if (result.success) {
                const displayResult = {
                    title: `📊 ${reportName}`,
                    metadata: {
                        '📈 Formulas': result.formulas.length,
                        '📊 Results': `${result.results.length} rows`,
                        '🔗 JOINs': result.metadata.actualJoins,
                        '📊 Aggregates': result.metadata.totalAggregateIntents,
                        '⚡ Optimization': `${result.metadata.totalJoinIntents} → ${result.metadata.actualJoins} joins`
                    },
                    sql: result.sql,
                    results: result.results
                };
                UI.showResult('reportResults', displayResult, 'success');
                
                // Save successful formulas to recents
                formulas.forEach(f => RecentFormulas.save(f.formula, tableName));
            } else {
                UI.showResult('reportResults', result.error, 'error');
            }
        } catch (error) {
            UI.showResult('reportResults', `Network error: ${error.message}`, 'error');
        } finally {
            UI.setButtonState('executeReportBtn', false, 'Generate Report');
        }
    },
    
    clearReport() {
        document.getElementById('reportName').value = '';
        document.getElementById('formulaBuilder').innerHTML = '';
        document.getElementById('reportResults').innerHTML = '';
        this.formulaRowCounter = 0;
        this.addFormulaRow();
    },
    
    saveReport() {
        const reportName = document.getElementById('reportName').value.trim();
        const tableName = document.getElementById('reportTableSelect').value;
        const formulaRows = document.querySelectorAll('#formulaBuilder .formula-row');
        
        if (!reportName) {
            alert('Please enter a report name');
            return;
        }
        
        if (!tableName) {
            alert('Please select a table');
            return;
        }
        
        const formulas = [];
        formulaRows.forEach(row => {
            const name = row.querySelector('.formula-name').value.trim();
            const formula = row.querySelector('.formula-input').value.trim();
            
            if (name && formula) {
                formulas.push({ name, formula });
            }
        });
        
        if (formulas.length === 0) {
            alert('Please add at least one formula');
            return;
        }
        
        const report = {
            id: Utils.generateUniqueId(),
            name: reportName,
            tableName: tableName,
            formulas: formulas,
            timestamp: Date.now()
        };
        
        // Save to localStorage
        const savedReports = this.getSavedReports();
        savedReports.unshift(report);
        
        // Keep only the most recent 20 reports
        const trimmed = savedReports.slice(0, 20);
        localStorage.setItem('saved_reports', JSON.stringify(trimmed));
        
        this.loadSavedReports();
        alert(`Report "${reportName}" saved successfully!`);
    },
    
    getSavedReports() {
        try {
            return JSON.parse(localStorage.getItem('saved_reports') || '[]');
        } catch (e) {
            return [];
        }
    },
    
    loadSavedReports() {
        const container = document.getElementById('savedReports');
        if (!container) return;
        
        const reports = this.getSavedReports();
        
        if (reports.length === 0) {
            container.innerHTML = '<p class="loading">No saved reports yet</p>';
            return;
        }
        
        const html = reports.map(report => `
            <div class="example-card" onclick="ReportBuilder.loadReport('${report.id}')">
                <h4>${Utils.escapeHtml(report.name)}</h4>
                <div class="example-table">Table: ${report.tableName}</div>
                <div class="example-description">${report.formulas.length} formulas • ${Utils.formatTimeAgo(new Date(report.timestamp))}</div>
                <div class="example-actions">
                    <span class="example-action" onclick="event.stopPropagation(); ReportBuilder.deleteReport('${report.id}')">🗑️ Delete</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    },
    
    loadReport(reportId) {
        const reports = this.getSavedReports();
        const report = reports.find(r => r.id === reportId);
        if (!report) return;
        
        // Set table
        document.getElementById('reportTableSelect').value = report.tableName;
        AppState.currentTable = report.tableName;
        
        // Set report name
        document.getElementById('reportName').value = report.name;
        
        // Clear existing formulas
        document.getElementById('formulaBuilder').innerHTML = '';
        this.formulaRowCounter = 0;
        
        // Add formulas
        report.formulas.forEach(formula => {
            this.addFormulaRow();
            const rows = document.querySelectorAll('#formulaBuilder .formula-row');
            const lastRow = rows[rows.length - 1];
            
            lastRow.querySelector('.formula-name').value = formula.name;
            lastRow.querySelector('.formula-input').value = formula.formula;
        });
        
        // Switch to reports tab
        UI.switchTab('reports');
    },
    
    deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            const reports = this.getSavedReports();
            const filtered = reports.filter(r => r.id !== reportId);
            localStorage.setItem('saved_reports', JSON.stringify(filtered));
            this.loadSavedReports();
        }
    },
    
    loadExampleReport() {
        const tableName = document.getElementById('reportTableSelect').value;
        
        if (!tableName) {
            alert('Please select a table first');
            return;
        }
        
        // Create example report based on table
        const exampleReports = {
            customer: {
                name: 'Customer Analysis Report',
                formulas: [
                    { name: 'Customer_Name', formula: 'first_name & " " & last_name' },
                    { name: 'Budget_Range', formula: 'STRING(budget_min) & " - " & STRING(budget_max)' },
                    { name: 'Budget_Flexibility', formula: 'ROUND((budget_max - budget_min) / budget_min * 100, 1) & "%"' }
                ]
            },
            listing: {
                name: 'Listing Analysis Report',
                formulas: [
                    { name: 'Property_Address', formula: 'address' },
                    { name: 'Price_Per_SqFt', formula: 'ROUND(listing_price / square_feet, 2)' },
                    { name: 'Market_Status', formula: 'IF(days_on_market < 30, "HOT", IF(days_on_market < 60, "NORMAL", "SLOW"))' },
                    { name: 'Days_Listed', formula: 'days_on_market & " days"' }
                ]
            },
            opportunity: {
                name: 'Opportunity Analysis Report',
                formulas: [
                    { name: 'Deal_Value', formula: 'STRING(estimated_value)' },
                    { name: 'Commission_Est', formula: 'ROUND(estimated_value * 0.03, 0)' },
                    { name: 'Stage_Status', formula: 'stage' }
                ]
            },
            rep: {
                name: 'Rep Performance Report',
                formulas: [
                    { name: 'Rep_Name', formula: 'first_name & " " & last_name' },
                    { name: 'Email_Contact', formula: 'email' },
                    { name: 'Phone_Contact', formula: 'phone' }
                ]
            }
        };
        
        const example = exampleReports[tableName];
        if (!example) {
            alert(`No example report available for table "${tableName}"`);
            return;
        }
        
        // Load the example
        document.getElementById('reportName').value = example.name;
        
        // Clear existing formulas
        document.getElementById('formulaBuilder').innerHTML = '';
        this.formulaRowCounter = 0;
        
        // Add example formulas
        example.formulas.forEach(formula => {
            this.addFormulaRow();
            const rows = document.querySelectorAll('#formulaBuilder .formula-row');
            const lastRow = rows[rows.length - 1];
            
            lastRow.querySelector('.formula-name').value = formula.name;
            lastRow.querySelector('.formula-input').value = formula.formula;
        });
    },
    
    updateFormulaInputsEnhancement(tableName) {
        // Update all formula inputs with new table context
        const formulaInputs = document.querySelectorAll('#formulaBuilder .formula-input');
        formulaInputs.forEach(input => {
            if (input.hasAttribute('data-enhanced')) {
                // Re-enhance with new table context
                enhanceFormulaInput(input, tableName);
            }
        });
    }
};

// =============================================================================
// DEVELOPER TOOLS INTEGRATION 
// =============================================================================

async function initializeDeveloperToolsIntegration() {
    try {
        console.log('🔧 Setting up developer tools integration...');
        
        // Initialize developer tools client
        if (window.developerToolsClient) {
            await window.developerToolsClient.initialize();
            
            // Update schema for developer tools
            await updateSchemaForDeveloperTools();
            
            console.log('🔧 Developer tools schema updated');
            
            // Initialize UI enhancements
            await initializeUIEnhancements();
        } else {
            console.warn('⚠️ Developer tools client not available');
        }
        
        console.log('✅ Developer tools ready');
        
    } catch (error) {
        console.warn('⚠️ Developer tools integration failed:', error);
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
            } else if (tabName === 'reports') {
                // Initialize report builder if not already done
                if (!ReportBuilder.initialized) {
                    ReportBuilder.init();
                    ReportBuilder.initialized = true;
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
        
        // Also sync other table selectors
        const schemaTableSelect = document.getElementById('schemaTableSelect');
        if (schemaTableSelect) {
            schemaTableSelect.value = e.target.value;
        }
        const reportTableSelect = document.getElementById('reportTableSelect');
        if (reportTableSelect) {
            reportTableSelect.value = e.target.value;
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
        
        // Also sync other table selectors
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect) {
            tableSelect.value = e.target.value;
            AppState.currentTable = e.target.value;
        }
        const reportTableSelect = document.getElementById('reportTableSelect');
        if (reportTableSelect) {
            reportTableSelect.value = e.target.value;
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
                const formula = e.target.value.trim();
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
        
        // Set the formula
        const formulaInput = document.getElementById('formulaInput');
        if (formulaInput) {
            formulaInput.value = example.formula;
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
        // Update individual tools with new table context
        if (window.autocomplete) {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                window.autocomplete.attachTo(formulaInput, tableName);
            }
        }
        
        if (window.syntaxHighlighting) {
            const formulaInput = document.getElementById('formulaInput');
            if (formulaInput) {
                window.syntaxHighlighting.attachTo(formulaInput, tableName);
            }
        }
        
        // Update report builder formula inputs as well
        if (ReportBuilder && ReportBuilder.updateFormulaInputsEnhancement) {
            ReportBuilder.updateFormulaInputsEnhancement(tableName);
        }
        
    } catch (error) {
        console.warn('Failed to update UI enhancements for table:', tableName, error);
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
window.validateFormula = validateFormula;
window.getDeveloperTools = getDeveloperTools;
window.updateDeveloperToolsSchema = updateDeveloperToolsSchema;