/**
 * Interactive Formula Compiler - Client-side JavaScript
 * Organized into logical modules for maintainability
 */

// =============================================================================
// GLOBAL STATE AND CONFIGURATION
// =============================================================================

const AppState = {
    currentTable: '',
    availableTables: [],
    recentFormulas: JSON.parse(localStorage.getItem('recentFormulas') || '[]'),
    validationTimeouts: new Map()
};

const CONFIG = {
    MAX_RECENT_FORMULAS: 10,
    VALIDATION_DELAY_MS: 500,
    MAX_EXAMPLES_PER_TABLE: 10,
    MAX_DISPLAY_ROWS: 10
};

// =============================================================================
// UTILITY FUNCTIONS
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
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    },

    generateUniqueId() {
        return Date.now() + Math.random();
    },

    showErrorTooltip(element, message) {
        this.hideErrorTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'error-tooltip';
        tooltip.textContent = message;
        tooltip.id = 'errorTooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    },

    hideErrorTooltip() {
        const existing = document.getElementById('errorTooltip');
        if (existing) {
            existing.remove();
        }
    }
};

// =============================================================================
// API SERVICE FUNCTIONS
// =============================================================================

const ApiService = {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${url}`, error);
            throw error;
        }
    },

    async getTables() {
        // Use browser API instead of server API
        if (window.getTables) {
            return window.getTables();
        }
        return this.request('/api/tables');
    },

    async getTableSchema(tableName) {
        // Use browser API instead of server API
        if (window.getTableSchema) {
            return window.getTableSchema(tableName);
        }
        return this.request(`/api/tables/${tableName}/schema`);
    },

    async getTableData(tableName, limit = 5) {
        return this.request(`/api/tables/${tableName}/data?limit=${limit}`);
    },

    async validateFormula(formula, tableName) {
        // Server-based validation no longer needed
        // Use frontend-only validation via developer tools
        if (window.getDeveloperTools) {
            const tools = window.getDeveloperTools();
            if (tools) {
                const diagnostics = tools.getDiagnostics(formula, tableName);
                const hasErrors = diagnostics.some(d => d.severity === 'error');
                return {
                    valid: !hasErrors,
                    error: hasErrors ? diagnostics.find(d => d.severity === 'error').message : null
                };
            }
        }
        return { valid: true }; // Fallback
    },

    async executeFormula(formula, tableName) {
        // Use browser API instead of server API
        if (window.executeFormula) {
            return window.executeFormula(formula, tableName);
        }
        return this.request('/api/execute', {
            method: 'POST',
            body: JSON.stringify({ formula, tableName })
        });
    },

    async executeMultipleFormulas(formulas, tableName) {
        return this.request('/api/execute-multiple', {
            method: 'POST',
            body: JSON.stringify({ formulas, tableName })
        });
    },

    async getExamples() {
        return this.request('/api/examples');
    },

    async getDatabaseInfo() {
        return this.request('/api/database/info');
    },

    async testDatabaseConnection(connectionString) {
        return this.request('/api/database/test', {
            method: 'POST',
            body: JSON.stringify({ connectionString })
        });
    },

    async switchDatabase(connectionString) {
        return this.request('/api/database/switch', {
            method: 'POST',
            body: JSON.stringify({ connectionString })
        });
    }
};

// =============================================================================
// UI MANAGEMENT FUNCTIONS
// =============================================================================

const UI = {
    showLoading(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    ${message}
                </div>
            `;
        }
    },

    showResult(elementId, result, type) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (type === 'error') {
            element.innerHTML = `
                <div class="results error">
                    <h3>❌ Error</h3>
                    <p><strong>Message:</strong> ${result}</p>
                </div>
            `;
            return;
        }

        if (type === 'success') {
            let html = `
                <div class="results success">
                    <h3>✅ ${result.title || 'Operation Successful'}</h3>
                    ${result.metadata ? this.renderMetadata(result.metadata) : ''}
                    ${result.sql ? this.renderSQL(result.sql) : ''}
                    ${result.results ? this.renderDataTable(result.results) : ''}
                </div>
            `;
            element.innerHTML = html;
        }
    },

    renderMetadata(metadata) {
        const items = Object.entries(metadata).map(([key, value]) => 
            `<div class="metadata-item">${key}: ${value}</div>`
        ).join('');
        
        return `
            <div class="metadata">
                ${items}
            </div>
        `;
    },

    renderSQL(sql) {
        return `
            <h4>📝 Generated SQL:</h4>
            <div class="sql-output">${Utils.escapeHtml(sql)}</div>
        `;
    },

    renderDataTable(data, maxRows = CONFIG.MAX_DISPLAY_ROWS) {
        if (!data.length) {
            return '<p><em>No results returned</em></p>';
        }

        const headers = Object.keys(data[0]);
        const displayData = data.slice(0, maxRows);
        
        let html = `
            <h4>📊 Results:</h4>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>${headers.map(key => `<th>${key}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${displayData.map(row => `
                            <tr>
                                ${headers.map(key => 
                                    `<td>${row[key] === null ? '<em>NULL</em>' : Utils.escapeHtml(String(row[key]))}</td>`
                                ).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        if (data.length > maxRows) {
            html += `<p><em>Showing first ${maxRows} of ${data.length} results</em></p>`;
        }

        return html;
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    },

    setButtonState(buttonId, loading = false, text = null) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        button.disabled = loading;
        if (text) {
            button.textContent = text;
        }
    }
};

// =============================================================================
// RECENT FORMULAS MANAGEMENT
// =============================================================================

const RecentFormulas = {
    save(formula, tableName) {
        const recent = {
            formula: formula,
            tableName: tableName,
            timestamp: new Date().toISOString(),
            id: Utils.generateUniqueId()
        };
        
        // Remove duplicates and limit size
        AppState.recentFormulas = AppState.recentFormulas
            .filter(r => r.formula !== formula || r.tableName !== tableName);
        AppState.recentFormulas.unshift(recent);
        AppState.recentFormulas = AppState.recentFormulas.slice(0, CONFIG.MAX_RECENT_FORMULAS);
        
        localStorage.setItem('recentFormulas', JSON.stringify(AppState.recentFormulas));
        this.render();
    },

    load(id) {
        const recent = AppState.recentFormulas.find(r => r.id == id);
        if (!recent) return;
        
        UI.switchTab('compiler');
        document.getElementById('tableSelect').value = recent.tableName;
        document.getElementById('formulaInput').value = recent.formula;
        AppState.currentTable = recent.tableName;
    },

    render() {
        const recentsList = document.getElementById('recentsList');
        if (!recentsList) return;
        
        if (AppState.recentFormulas.length === 0) {
            recentsList.innerHTML = '<p class="loading">No recent formulas yet</p>';
            return;
        }
        
        const html = AppState.recentFormulas.map(recent => {
            const timeAgo = Utils.formatTimeAgo(new Date(recent.timestamp));
            return `
                <div class="recent-item" onclick="RecentFormulas.load('${recent.id}')">
                    <div class="recent-formula">${Utils.escapeHtml(recent.formula)}</div>
                    <div class="recent-meta">
                        <span>📊 ${recent.tableName}</span>
                        <span>⏰ ${timeAgo}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        recentsList.innerHTML = html;
    }
};

// =============================================================================
// VALIDATION SYSTEM
// =============================================================================

const Validation = {
    addToElement(textarea) {
        textarea.addEventListener('input', () => {
            const formula = textarea.value.trim();
            const tableName = document.getElementById('reportTableSelect')?.value || 
                            document.getElementById('tableSelect')?.value;
            
            if (!formula || !tableName) {
                textarea.className = 'formula-input';
                Utils.hideErrorTooltip();
                return;
            }
            
            this.scheduleValidation(textarea, formula, tableName);
        });
    },

    scheduleValidation(textarea, formula, tableName) {
        // Clear previous timeout
        const timeoutId = AppState.validationTimeouts.get(textarea);
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Set new timeout for validation
        const newTimeoutId = setTimeout(() => {
            this.validateFormula(formula, tableName, textarea);
        }, CONFIG.VALIDATION_DELAY_MS);
        
        AppState.validationTimeouts.set(textarea, newTimeoutId);
    },

    async validateFormula(formula, tableName, element) {
        try {
            // Use frontend-only validation via developer tools
            if (window.getDeveloperTools) {
                const tools = window.getDeveloperTools();
                if (tools) {
                    const diagnostics = tools.getDiagnostics(formula, tableName);
                    const hasErrors = diagnostics.some(d => d.severity === 'error');
                    
                    if (!hasErrors) {
                        element.className = 'formula-input success';
                        Utils.hideErrorTooltip();
                    } else {
                        const errorDiagnostic = diagnostics.find(d => d.severity === 'error');
                        element.className = 'formula-input error';
                        Utils.showErrorTooltip(element, errorDiagnostic.message || 'Invalid formula');
                    }
                    return;
                }
            }
            
            // Fallback: try basic compilation for validation
            const result = await ApiService.validateFormula(formula, tableName);
            
            if (result.valid) {
                element.className = 'formula-input success';
                Utils.hideErrorTooltip();
            } else {
                element.className = 'formula-input error';
                Utils.showErrorTooltip(element, result.error);
            }
        } catch (error) {
            element.className = 'formula-input error';
            Utils.showErrorTooltip(element, 'Validation failed');
        }
    }
};

// =============================================================================
// TAB: FORMULA COMPILER
// =============================================================================

const FormulaCompiler = {
    async execute() {
        const formulaInput = window.formulaEditor || document.getElementById('formulaInput');
        const formula = formulaInput.value ? formulaInput.value.trim() : '';
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
            const result = await ApiService.executeFormula(formula, tableName);
            
            if (result.success) {
                const displayResult = {
                    title: 'Formula Executed Successfully',
                    metadata: {
                        '📊 Results': `${result.results.length} rows`,
                        '🔗 JOINs': result.metadata.joinCount,
                        '📈 Aggregates': result.metadata.aggregateCount
                    },
                    sql: result.sql,
                    results: result.results
                };
                UI.showResult('formulaResults', displayResult, 'success');
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
        const formulaInput = window.formulaEditor || document.getElementById('formulaInput');
        if (formulaInput.clear) {
            formulaInput.clear();
        } else {
            formulaInput.value = '';
        }
        document.getElementById('formulaResults').innerHTML = '';
    }
};

// =============================================================================
// TAB: REPORT BUILDER
// =============================================================================

const ReportBuilder = {
    init() {
        // Initialize with one formula row only if formulaBuilder exists
        const formulaBuilder = document.getElementById('formulaBuilder');
        if (formulaBuilder) {
            this.addFormulaRow();
        }
    },

    addFormulaRow() {
        const formulaBuilder = document.getElementById('formulaBuilder');
        if (!formulaBuilder) {
            console.warn('formulaBuilder element not found, skipping row addition');
            return;
        }
        
        const newRow = document.createElement('div');
        newRow.className = 'formula-row';
        newRow.innerHTML = `
            <input type="text" placeholder="Column Name" class="formula-name">
            <textarea placeholder="Formula" class="formula-input" rows="2"></textarea>
            <button class="btn-remove" onclick="ReportBuilder.removeFormulaRow(this)">✕</button>
        `;
        formulaBuilder.appendChild(newRow);
        
        // Add validation to the new textarea
        const textarea = newRow.querySelector('.formula-input');
        Validation.addToElement(textarea);
    },

    removeFormulaRow(button) {
        button.parentElement.remove();
    },

    async executeReport() {
        const tableName = document.getElementById('reportTableSelect').value;
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
            const name = row.querySelector('.formula-name').value.trim() || `Column_${index + 1}`;
            const formula = row.querySelector('.formula-input').value.trim();
            
            if (!formula) {
                hasErrors = true;
                return;
            }
            
            formulas.push({ name, formula });
        });
        
        if (hasErrors) {
            UI.showResult('reportResults', 'Please fill in all formulas', 'error');
            return;
        }
        
        UI.setButtonState('executeReportBtn', true, 'Generating Report...');
        
        try {
            const result = await ApiService.executeMultipleFormulas(formulas, tableName);
            
            if (result.success) {
                const displayResult = {
                    title: 'Multi-Formula Report Generated',
                    metadata: {
                        '📈 Formulas': result.formulas.length,
                        '📊 Results': `${result.results.length} rows`,
                        '🔗 JOINs': result.metadata.actualJoins,
                        '📊 Aggregates': result.metadata.totalAggregateIntents
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
        document.getElementById('formulaBuilder').innerHTML = '';
        this.addFormulaRow();
        document.getElementById('reportResults').innerHTML = '';
    }
};

// =============================================================================
// TAB: EXAMPLES
// =============================================================================

const Examples = {
    async load() {
        UI.showLoading('examplesList', 'Loading examples...');
        
        try {
            const data = await ApiService.getExamples();
            this.render(data.examples);
        } catch (error) {
            document.getElementById('examplesList').innerHTML = 
                `<p class="error">Error loading examples: ${error.message}</p>`;
        }
    },

    render(examples) {
        let html = '';
        
        Object.entries(examples).forEach(([table, tableExamples]) => {
            if (tableExamples.length > 0) {
                html += `<h3>📊 ${table} Table Examples</h3>`;
                
                tableExamples.forEach(example => {
                    html += `
                        <div class="example-card" onclick="Examples.loadExample('${example.formula}', '${table}')">
                            <h4>${example.name}</h4>
                            <div class="example-code">${Utils.escapeHtml(example.formula)}</div>
                        </div>
                    `;
                });
            }
        });
        
        if (html === '') {
            html = '<p>No examples found</p>';
        }
        
        document.getElementById('examplesList').innerHTML = html;
    },

    loadExample(formula, table) {
        UI.switchTab('compiler');
        document.getElementById('tableSelect').value = table;
        
        // Clear any previous error states before loading new example
        if (window.LiveExecution) {
            window.LiveExecution.hideError();
            window.LiveExecution.updateStatus('ready', 'Ready');
        }
        
        // Clear previous results
        const resultsElement = document.getElementById('formulaResults');
        if (resultsElement) {
            resultsElement.innerHTML = '';
        }
        
        // Set formula in Monaco editor if available, otherwise fallback to textarea
        try {
            if (window.enhancedMonaco && window.enhancedMonaco.editors.get('formulaInput')) {
                window.enhancedMonaco.editors.get('formulaInput').editor.setValue(formula);
                console.log('📝 Example loaded into Monaco editor:', formula);
            } else if (window.formulaEditor && window.formulaEditor.editor) {
                window.formulaEditor.editor.setValue(formula);
                console.log('📝 Example loaded into formula editor:', formula);
            } else {
                // Fallback to regular textarea
                document.getElementById('formulaInput').value = formula;
                console.log('📝 Example loaded into textarea (fallback):', formula);
            }
        } catch (error) {
            console.warn('Failed to set Monaco editor value, using textarea fallback:', error);
            document.getElementById('formulaInput').value = formula;
        }
        
        AppState.currentTable = table;
        
        // Update table context for Monaco editor
        if (window.enhancedMonaco) {
            try {
                window.enhancedMonaco.setTableContext('formulaInput', table);
                console.log('📊 Table context updated to:', table);
            } catch (error) {
                console.warn('Failed to update table context:', error);
            }
        }
    }
};

// =============================================================================
// TAB: DATABASE SCHEMA
// =============================================================================

const DatabaseSchema = {
    async loadTableSchema(tableName) {
        if (!tableName) {
            document.getElementById('schemaDetails').innerHTML = 
                '<p class="loading">Select a table to view its schema and sample data</p>';
            return;
        }
        
        UI.showLoading('schemaDetails', `Loading schema for ${tableName}...`);
        
        try {
            const [schema, data] = await Promise.all([
                ApiService.getTableSchema(tableName),
                ApiService.getTableData(tableName, 3)
            ]);
            
            this.renderSchema(schema, data.data);
        } catch (error) {
            document.getElementById('schemaDetails').innerHTML = 
                `<p class="error">Error loading schema: ${error.message}</p>`;
        }
    },

    renderSchema(schema, sampleData) {
        let html = `
            <div class="schema-section">
                <h4>📋 Columns (${schema.columns.length})</h4>
                <div class="columns-grid">
                    ${schema.columns.map(col => `
                        <div class="column-item">
                            <div class="column-name">${col.column_name}</div>
                            <div class="column-type">${col.data_type}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        if (schema.directRelationships && schema.directRelationships.length > 0) {
            html += `
                <div class="schema-section">
                    <h4>🔗 Direct Relationships (${schema.directRelationships.length})</h4>
                    <div class="columns-grid">
                        ${schema.directRelationships.map(rel => `
                            <div class="relationship-badge" onclick="DatabaseSchema.navigateToTable('${rel.target_table_name}')">
                                <div class="column-name">${rel.relationship_name}</div>
                                <div class="column-type">→ ${rel.target_table_name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (schema.reverseRelationships && schema.reverseRelationships.length > 0) {
            html += `
                <div class="schema-section">
                    <h4>⬅️ Reverse Relationships (${schema.reverseRelationships.length})</h4>
                    <div class="columns-grid">
                        ${schema.reverseRelationships.map(rel => `
                            <div class="relationship-badge reverse" onclick="DatabaseSchema.navigateToTable('${rel.source_table_name}')">
                                <div class="column-name">${rel.relationship_name}</div>
                                <div class="column-type">← ${rel.source_table_name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (sampleData.length > 0) {
            html += `
                <div class="schema-section">
                    <h4>📊 Sample Data (${sampleData.length} rows)</h4>
                    ${UI.renderDataTable(sampleData)}
                </div>
            `;
        }
        
        document.getElementById('schemaDetails').innerHTML = html;
    },

    navigateToTable(tableName) {
        const schemaTableSelect = document.getElementById('schemaTableSelect');
        schemaTableSelect.value = tableName;
        this.loadTableSchema(tableName);
    }
};

// =============================================================================
// TAB: DATABASE MANAGEMENT
// =============================================================================

const DatabaseManager = {
    async loadInfo() {
        try {
            const data = await ApiService.getDatabaseInfo();
            this.renderCurrentConnection(data);
            this.updateForm(data);
        } catch (error) {
            this.renderError('Failed to load database info', error.message);
        }
    },

    renderCurrentConnection(data) {
        const currentDbInfo = document.getElementById('currentDbInfo');
        
        if (data.status === 'connected') {
            currentDbInfo.className = 'current-db-info connected';
            currentDbInfo.innerHTML = `
                <div class="db-status">✅ Connected</div>
                <div class="db-type">Database Type: ${data.type.toUpperCase()}</div>
                ${data.connectionString ? `<div class="db-connection">Connection: ${data.connectionString}</div>` : ''}
            `;
        } else {
            currentDbInfo.className = 'current-db-info error';
            currentDbInfo.innerHTML = `
                <div class="db-status">❌ Error</div>
                <div class="db-type">Error: ${data.error}</div>
            `;
        }
    },

    updateForm(data) {
        const dbType = document.getElementById('dbType');
        const connectionStringGroup = document.getElementById('connectionStringGroup');
        const connectionString = document.getElementById('connectionString');
        
        dbType.value = data.type;
        if (data.type === 'postgresql') {
            connectionStringGroup.style.display = 'block';
            connectionString.value = data.connectionString ? 
                data.connectionString.replace(':****@', ':password@') : '';
        } else {
            connectionStringGroup.style.display = 'none';
        }
    },

    renderError(title, message) {
        const currentDbInfo = document.getElementById('currentDbInfo');
        currentDbInfo.className = 'current-db-info error';
        currentDbInfo.innerHTML = `
            <div class="db-status">❌ ${title}</div>
            <div class="db-type">Error: ${message}</div>
        `;
    },

    async testConnection() {
        const dbType = document.getElementById('dbType').value;
        const connectionString = document.getElementById('connectionString').value;
        
        UI.setButtonState('testConnectionBtn', true, 'Testing...');
        
        try {
            const result = await ApiService.testDatabaseConnection(
                dbType === 'postgresql' ? connectionString : ''
            );
            
            const resultsDiv = document.getElementById('databaseResults');
            if (result.success) {
                resultsDiv.innerHTML = `
                    <div class="results success">
                        <h4>✅ Connection Test Successful</h4>
                        <p><strong>Type:</strong> ${result.type.toUpperCase()}</p>
                        <p><strong>Message:</strong> ${result.message}</p>
                    </div>
                `;
            } else {
                resultsDiv.innerHTML = `
                    <div class="results error">
                        <h4>❌ Connection Test Failed</h4>
                        <p><strong>Error:</strong> ${result.error}</p>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById('databaseResults').innerHTML = `
                <div class="results error">
                    <h4>❌ Connection Test Failed</h4>
                    <p><strong>Error:</strong> ${error.message}</p>
                </div>
            `;
        } finally {
            UI.setButtonState('testConnectionBtn', false, 'Test Connection');
        }
    },

    async switchDatabase() {
        const dbType = document.getElementById('dbType').value;
        const connectionString = document.getElementById('connectionString').value;
        
        UI.setButtonState('switchDatabaseBtn', true, 'Switching...');
        
        try {
            const result = await ApiService.switchDatabase(
                dbType === 'postgresql' ? connectionString : ''
            );
            
            const resultsDiv = document.getElementById('databaseResults');
            if (result.success) {
                resultsDiv.innerHTML = `
                    <div class="results success">
                        <h4>✅ Database Switch Successful</h4>
                        <p><strong>New Type:</strong> ${result.type.toUpperCase()}</p>
                        <p><strong>Message:</strong> ${result.message}</p>
                        ${result.connectionString ? `<p><strong>Connection:</strong> ${result.connectionString}</p>` : ''}
                    </div>
                `;
                
                // Refresh database info and reload tables
                setTimeout(() => {
                    this.loadInfo();
                    Tables.load();
                }, 1000);
            } else {
                resultsDiv.innerHTML = `
                    <div class="results error">
                        <h4>❌ Database Switch Failed</h4>
                        <p><strong>Error:</strong> ${result.error}</p>
                    </div>
                `;
            }
        } catch (error) {
            document.getElementById('databaseResults').innerHTML = `
                <div class="results error">
                    <h4>❌ Database Switch Failed</h4>
                    <p><strong>Error:</strong> ${error.message}</p>
                </div>
            `;
        } finally {
            UI.setButtonState('switchDatabaseBtn', false, 'Switch Database');
        }
    }
};

// =============================================================================
// TABLE MANAGEMENT
// =============================================================================

const Tables = {
    async load() {
        try {
            const data = await ApiService.getTables();
            AppState.availableTables = data.tables;
            this.populateSelectors();
            RecentFormulas.render();
        } catch (error) {
            console.error('Error loading tables:', error);
            document.getElementById('tableSelect').innerHTML = 
                '<option value="">Error loading tables</option>';
        }
    },

    populateSelectors() {
        const selectors = ['tableSelect', 'schemaTableSelect', 'reportTableSelect'];
        const options = {
            tableSelect: 'Select a table...',
            schemaTableSelect: 'Choose a table to view its schema',
            reportTableSelect: 'Select a table for reporting...'
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
        
        // Auto-select default table
        const defaultTable = AppState.availableTables.includes('customer') ? 
            'customer' : AppState.availableTables[0];
        
        if (defaultTable) {
            document.getElementById('tableSelect').value = defaultTable;
            document.getElementById('reportTableSelect').value = defaultTable;
            AppState.currentTable = defaultTable;
        }
    }
};

// =============================================================================
// EVENT LISTENERS AND INITIALIZATION
// =============================================================================

const EventListeners = {
    init() {
        console.log('🎬 [MAIN] Setting up event listeners...');
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.handleTabSwitch(tab);
            });
        });

        // Formula compiler - only if elements exist
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.addEventListener('click', FormulaCompiler.execute);
        }
        
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', FormulaCompiler.clear);
        }
        
        // Table selection
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect) {
            tableSelect.addEventListener('change', (e) => {
                AppState.currentTable = e.target.value;
            });
        }
        
        // Report builder - only if elements exist
        const executeReportBtn = document.getElementById('executeReportBtn');
        if (executeReportBtn) {
            executeReportBtn.addEventListener('click', ReportBuilder.executeReport);
        }
        
        const clearReportBtn = document.getElementById('clearReportBtn');
        if (clearReportBtn) {
            clearReportBtn.addEventListener('click', ReportBuilder.clearReport);
        }
        
        const reportTableSelect = document.getElementById('reportTableSelect');
        if (reportTableSelect) {
            reportTableSelect.addEventListener('change', () => {
                document.querySelectorAll('.formula-input').forEach(textarea => {
                    Validation.addToElement(textarea);
                });
            });
        }
        
        // Schema browser
        const schemaTableSelect = document.getElementById('schemaTableSelect');
        if (schemaTableSelect) {
            schemaTableSelect.addEventListener('change', (e) => {
                DatabaseSchema.loadTableSchema(e.target.value);
            });
        }
        
        // Database management - only if elements exist
        const dbType = document.getElementById('dbType');
        if (dbType) {
            dbType.addEventListener('change', (e) => {
                const connectionStringGroup = document.getElementById('connectionStringGroup');
                if (connectionStringGroup) {
                    connectionStringGroup.style.display = e.target.value === 'postgresql' ? 'block' : 'none';
                }
            });
        }
        
        const testConnectionBtn = document.getElementById('testConnectionBtn');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', DatabaseManager.testConnection);
        }
        
        const switchDatabaseBtn = document.getElementById('switchDatabaseBtn');
        if (switchDatabaseBtn) {
            switchDatabaseBtn.addEventListener('click', DatabaseManager.switchDatabase);
        }
        
        console.log('🎬 [MAIN] Event listeners set up successfully');
        
        // Note: Formula input event handling is now done in Monaco setup
    },

    handleTabSwitch(tab) {
        // Update UI
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
        
        // Load tab-specific data
        switch (tab.dataset.tab) {
            case 'examples':
                Examples.load();
                break;
            case 'report-builder':
                ReportBuilder.init();
                break;
            case 'database':
                DatabaseManager.loadInfo();
                break;
        }
    }
};

// =============================================================================
// DEVELOPER TOOLS INTEGRATION
// =============================================================================

const DeveloperToolsIntegration = {
    async init() {
        try {
            console.log('🔧 Initializing developer tools...');
            
            // Initialize Enhanced Monaco Editor first (independent of developer tools)
            await this.setupMonacoEditor();
            
            // Try to initialize the developer tools client if available
            if (window.developerTools) {
                await window.developerTools.initialize();
                console.log('✅ Developer tools initialized successfully');
            } else {
                console.log('⚠️ Developer tools not available, continuing with Monaco only');
            }
            
            // Watch for new inputs (legacy support)
            this.setupDynamicAttachment();
            
            // Update schema
            await this.updateSchema();
            
        } catch (error) {
            console.warn('⚠️ Failed to initialize developer tools:', error);
        }
    },

    async setupMonacoEditor() {
        try {
            console.log('🔧 [DEBUG] Starting setupMonacoEditor...');
            
            // Wait for enhanced Monaco to be ready
            console.log('🔧 [DEBUG] Waiting for enhanced Monaco...');
            let waitTime = 0;
            while (!window.enhancedMonaco && waitTime < 10000) {
                await new Promise(resolve => setTimeout(resolve, 100));
                waitTime += 100;
            }
            
            if (!window.enhancedMonaco) {
                throw new Error('Enhanced Monaco not available after waiting 10 seconds');
            }
            
            console.log('🔧 [DEBUG] Enhanced Monaco found, creating editor...');
            
            // Create enhanced editor for the main formula input
            const editorWrapper = window.enhancedMonaco.createEditor('formulaInput');
            
            console.log('🔧 [DEBUG] createEditor returned:', editorWrapper ? 'success' : 'null');
            
            if (editorWrapper) {
                // Store reference for later access
                window.formulaEditor = editorWrapper;
                console.log('🔧 [DEBUG] Stored formulaEditor reference');
                
                // Set up event handlers for compatibility
                this.setupEditorEventHandlers(editorWrapper);
                console.log('🔧 [DEBUG] Event handlers set up');
                
                // Set initial table context
                const currentTable = AppState.currentTable;
                if (currentTable) {
                    window.enhancedMonaco.setTableContext('formulaInput', currentTable);
                    console.log('🔧 [DEBUG] Table context set to:', currentTable);
                }
                
                console.log('🚀 Enhanced Monaco Editor initialized');
            } else {
                console.error('🔧 [DEBUG] createEditor returned null - editor creation failed');
            }
        } catch (error) {
            console.error('Failed to setup enhanced Monaco editor:', error);
        }
    },

    async attachToolingToEditor(editorWrapper) {
        const tableName = this.getTableContext();
        
        // Wait for tooling to be ready
        while (!window.syntaxHighlighting || !window.autocomplete || !window.formatterIntegration) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Syntax highlighting
        if (window.syntaxHighlighting) {
            window.syntaxHighlighting.attachTo(editorWrapper, tableName);
        }
        
        // Autocomplete
        if (window.autocomplete) {
            window.autocomplete.attachTo(editorWrapper, tableName);
        }
        
        // Formatting
        if (window.formatterIntegration) {
            window.formatterIntegration.attachTo(editorWrapper, {
                showButton: true,
                keyboardShortcut: true,
                autoFormat: {
                    onBlur: false,
                    onSave: true
                }
            });
        }
    },

    setupEditorEventHandlers(editorWrapper) {
        // Set up validation
        editorWrapper.addEventListener('input', () => {
            const formula = editorWrapper.value.trim();
            const tableName = this.getTableContext();
            
            if (formula && tableName) {
                this.scheduleValidation(editorWrapper, formula, tableName);
            }
        });
        
        // Set up Enter key handling
        editorWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                FormulaCompiler.execute();
            }
        });
        
        // Set up focus/blur events
        editorWrapper.addEventListener('focus', () => {
            console.log('Monaco editor focused');
        });
        
        editorWrapper.addEventListener('blur', () => {
            console.log('Monaco editor blurred');
        });
    },

    scheduleValidation(editorWrapper, formula, tableName) {
        // Clear previous timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        
        // Schedule validation
        this.validationTimeout = setTimeout(() => {
            this.validateFormula(formula, tableName, editorWrapper);
        }, 500);
    },

    async validateFormula(formula, tableName, editorWrapper) {
        try {
            // Use frontend-only validation via developer tools
            if (window.getDeveloperTools) {
                const tools = window.getDeveloperTools();
                if (tools) {
                    const diagnostics = tools.getDiagnostics(formula, tableName);
                    const hasErrors = diagnostics.some(d => d.severity === 'error');
                    
                    if (!hasErrors) {
                        const container = editorWrapper._monaco.getDomNode().parentElement;
                        container.classList.remove('error');
                        container.classList.add('success');
                        this.hideErrorMessage();
                    } else {
                        const errorDiagnostic = diagnostics.find(d => d.severity === 'error');
                        const container = editorWrapper._monaco.getDomNode().parentElement;
                        container.classList.remove('success');
                        container.classList.add('error');
                        this.showErrorMessage(errorDiagnostic.message || 'Invalid formula');
                    }
                    return;
                }
            }
            
            // Fallback: try basic compilation for validation
            const result = await ApiService.validateFormula(formula, tableName);
            
            if (result.valid) {
                const container = editorWrapper._monaco.getDomNode().parentElement;
                container.classList.remove('error');
                container.classList.add('success');
                this.hideErrorMessage();
            } else {
                const container = editorWrapper._monaco.getDomNode().parentElement;
                container.classList.remove('success');
                container.classList.add('error');
                this.showErrorMessage(result.error);
            }
        } catch (error) {
            console.warn('Validation failed:', error);
            this.showErrorMessage('Validation failed');
        }
    },

    showErrorMessage(message) {
        const errorDiv = document.getElementById('formulaError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    },

    hideErrorMessage() {
        const errorDiv = document.getElementById('formulaError');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    },

    setupSyntaxHighlighting() {
        const inputs = this.getFormulaInputs();
        inputs.forEach(textarea => {
            const tableName = this.getTableContext(textarea);
            window.syntaxHighlighting.attachTo(textarea, tableName);
        });
    },

    setupAutocomplete() {
        const inputs = this.getFormulaInputs();
        inputs.forEach(textarea => {
            const tableName = this.getTableContext(textarea);
            window.autocomplete.attachTo(textarea, tableName);
        });
    },

    setupFormatting() {
        const inputs = this.getFormulaInputs();
        inputs.forEach(textarea => {
            const tableName = this.getTableContext(textarea);
            
            // Add format button next to each formula input
            const formatButton = this.createFormatButton(textarea);
            this.insertFormatButton(textarea, formatButton);
            
            // Attach formatter with keyboard shortcut
            window.formatterIntegration.attachTo(textarea, {
                showButton: false, // We create our own
                keyboardShortcut: true,
                autoFormat: false
            });
        });
    },

    createFormatButton(textarea) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Format';
        button.className = 'btn btn-secondary btn-sm';
        button.title = 'Format formula (Shift+Alt+F)';
        button.style.cssText = `
            margin-left: 8px;
            padding: 4px 8px;
            font-size: 12px;
            vertical-align: top;
        `;
        
        button.addEventListener('click', async () => {
            try {
                button.textContent = 'Formatting...';
                button.disabled = true;
                
                const formatted = await window.developerTools.format(textarea.value);
                if (formatted !== textarea.value) {
                    textarea.value = formatted;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Show brief success feedback
                    const originalText = button.textContent;
                    button.textContent = '✓';
                    button.style.color = '#28a745';
                    setTimeout(() => {
                        button.textContent = 'Format';
                        button.style.color = '';
                    }, 1000);
                } else {
                    button.textContent = 'Already formatted';
                    setTimeout(() => {
                        button.textContent = 'Format';
                    }, 1500);
                }
            } catch (error) {
                button.textContent = 'Error';
                button.style.color = '#dc3545';
                setTimeout(() => {
                    button.textContent = 'Format';
                    button.style.color = '';
                }, 2000);
            } finally {
                button.disabled = false;
            }
        });
        
        return button;
    },

    insertFormatButton(textarea, button) {
        // Find the best place to insert the button
        const container = textarea.parentNode;
        
        // If there's already a button group nearby, add to it
        let buttonGroup = container.querySelector('.btn-group');
        if (buttonGroup) {
            buttonGroup.appendChild(button);
            return;
        }
        
        // Look for existing buttons to group with
        const existingButton = container.querySelector('button');
        if (existingButton && existingButton.nextSibling === textarea) {
            // Insert after existing button
            container.insertBefore(button, existingButton.nextSibling);
            return;
        }
        
        // Create a wrapper div and insert after textarea
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: inline-block; margin-top: 4px;';
        wrapper.appendChild(button);
        
        if (textarea.nextSibling) {
            container.insertBefore(wrapper, textarea.nextSibling);
        } else {
            container.appendChild(wrapper);
        }
    },

    setupDynamicAttachment() {
        // Watch for dynamically added formula inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newInputs = node.matches?.('textarea.formula-input, textarea[id*="formula"]') 
                            ? [node] 
                            : node.querySelectorAll?.('textarea.formula-input, textarea[id*="formula"]') || [];
                        
                        newInputs.forEach(textarea => {
                            const tableName = this.getTableContext(textarea);
                            
                            // Attach all tools
                            window.syntaxHighlighting.attachTo(textarea, tableName);
                            window.autocomplete.attachTo(textarea, tableName);
                            
                            // Add format button
                            const formatButton = this.createFormatButton(textarea);
                            this.insertFormatButton(textarea, formatButton);
                            
                            window.formatterIntegration.attachTo(textarea, {
                                showButton: false,
                                keyboardShortcut: true
                            });
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    getFormulaInputs() {
        return document.querySelectorAll('textarea#formulaInput, textarea.formula-input, textarea[id*="formula"]');
    },

    getTableContext(textarea) {
        // Try to get table context from various sources
        if (textarea && textarea.closest) {
            const form = textarea.closest('form') || document.body;
            
            // Look for table select in same form/context
            const tableSelect = form.querySelector('select[id*="table"]');
            if (tableSelect && tableSelect.value) {
                return tableSelect.value;
            }
            
            // Check data attribute
            if (textarea.dataset && textarea.dataset.tableName) {
                return textarea.dataset.tableName;
            }
        }
        
        // For Monaco editor or when no textarea context available
        const tableSelect = document.getElementById('tableSelect');
        if (tableSelect && tableSelect.value) {
            return tableSelect.value;
        }
        
        // Use app state
        return AppState.currentTable || null;
    },

    async updateSchema() {
        try {
            // Try to get schema from browser API first (for client-side app)
            let schema = null;
            
            if (window.browserAPI) {
                // Get schema from browser API
                const tables = await window.browserAPI.getTables();
                schema = { tables: {}, relationships: [] };
                
                for (const tableName of tables) {
                    const tableData = await window.browserAPI.getTableSchema(tableName);
                    schema.tables[tableName] = {
                        columns: tableData.columns || [],
                        directRelationships: tableData.directRelationships || [],
                        reverseRelationships: tableData.reverseRelationships || []
                    };
                    schema.relationships.push(...(tableData.directRelationships || []));
                }
                
                console.log('📋 Schema loaded from browser API');
            } else {
                // Fallback to server API
                const schemaResponse = await fetch('/api/tables');
                const { tables } = await schemaResponse.json();
                
                schema = { tables: {}, relationships: [] };
                
                for (const tableName of tables) {
                    const tableResponse = await fetch(`/api/tables/${tableName}/schema`);
                    const tableData = await tableResponse.json();
                    
                    schema.tables[tableName] = {
                        columns: tableData.columns || [],
                        directRelationships: tableData.directRelationships || [],
                        reverseRelationships: tableData.reverseRelationships || []
                    };
                    schema.relationships.push(...(tableData.directRelationships || []));
                }
                
                console.log('📋 Schema loaded from server API');
            }
            
            // Update all available tools
            if (window.developerTools) {
                window.developerTools.updateSchema(schema);
            }
            if (window.autocomplete) {
                window.autocomplete.updateSchema(schema);
            }
            if (window.syntaxHighlighting) {
                window.syntaxHighlighting.updateSchema(schema);
            }
            
            // Update enhanced Monaco with schema
            if (window.enhancedMonaco) {
                window.enhancedMonaco.updateSchema(schema);
                console.log('📋 Enhanced Monaco schema updated');
            }
            
        } catch (error) {
            console.warn('Failed to update developer tools schema:', error);
        }
    },

    // Called when table selection changes
    onTableChange(tableName) {
        // Update context for all formula inputs
        this.getFormulaInputs().forEach(textarea => {
            textarea.dataset.tableName = tableName;
        });
        
        // Update enhanced Monaco context
        if (window.enhancedMonaco) {
            window.enhancedMonaco.setTableContext('formulaInput', tableName);
        }
    }
};

// =============================================================================
// APPLICATION INITIALIZATION
// =============================================================================

async function initializeApp() {
    console.log('🎬 [MAIN] Starting application initialization...');
    
    try {
        // Initialize browser API first
        if (window.initializeBrowserAPI) {
            console.log('🎬 [MAIN] Initializing browser API...');
            await window.initializeBrowserAPI();
            console.log('🎬 [MAIN] Browser API initialized successfully');
        } else {
            console.warn('🎬 [MAIN] Browser API not available, will use server APIs');
        }
        
        // Set up event listeners
        console.log('🎬 [MAIN] Initializing event listeners...');
        EventListeners.init();
        
        // Load initial data
        console.log('🎬 [MAIN] Loading initial data...');
        await Tables.load();
        
        // Initialize report builder
        console.log('🎬 [MAIN] Initializing report builder...');
        ReportBuilder.init();
        
        // Initialize developer tools
        console.log('🎬 [MAIN] About to initialize developer tools...');
        try {
            await DeveloperToolsIntegration.init();
            console.log('🎬 [MAIN] Developer tools initialization completed');
        } catch (error) {
            console.error('🎬 [MAIN] Developer tools initialization failed:', error);
        }
        
        // Listen for table changes to update developer tools context
        console.log('🎬 [MAIN] Setting up table change listeners...');
        document.addEventListener('change', (e) => {
            if (e.target.matches('select[id*="table"]')) {
                DeveloperToolsIntegration.onTableChange(e.target.value);
            }
        });
        
        // Switch to first tab
        UI.switchTab('compiler');
        
        console.log('🚀 Interactive Formula Compiler with Developer Tools initialized');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        // Show user-friendly error message
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h2>Application Failed to Initialize</h2>
                <p>There was an error starting the application. Please refresh the page and try again.</p>
                <details>
                    <summary>Technical Details</summary>
                    <pre>${error.message}</pre>
                </details>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);