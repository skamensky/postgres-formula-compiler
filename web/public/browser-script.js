/**
 * Browser-Based Formula Compiler Interface
 * Uses client-side modules for all processing - no server APIs needed!
 */

import { initializeBrowserAPI, executeFormula, getTables, getTableSchema, validateFormula, getDeveloperTools, updateDeveloperToolsSchema } from './modules/shared/browser-api.js';

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
// FORMULA COMPILER
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
            document.getElementById('formulaInput').value = formula.formula;
            document.getElementById('tableSelect').value = formula.tableName;
            AppState.currentTable = formula.tableName;
            UI.switchTab('compiler');
        }
    }
};

// =============================================================================
// DEVELOPER TOOLS INTEGRATION 
// =============================================================================

async function initializeDeveloperToolsIntegration() {
    try {
        console.log('🔧 Setting up developer tools integration...');
        
        // Update schema for developer tools
        await updateSchemaForDeveloperTools();
        
        console.log('✅ Developer tools ready');
        
    } catch (error) {
        console.warn('⚠️ Developer tools integration failed:', error);
    }
}

async function updateSchemaForDeveloperTools() {
    try {
        const schema = { tables: {}, relationships: [] };
        
        // Fetch detailed schema for each table
        for (const tableName of AppState.availableTables) {
            const tableData = await getTableSchema(tableName);
            
            schema.tables[tableName] = {
                columns: tableData.columns || [],
                directRelationships: tableData.directRelationships || [],
                reverseRelationships: tableData.reverseRelationships || []
            };
            
            schema.relationships.push(...(tableData.directRelationships || []));
        }
        
        // Update developer tools with schema
        updateDeveloperToolsSchema(schema);
        
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
            }
        });
    });

    // Formula compiler
    document.getElementById('executeBtn').addEventListener('click', FormulaCompiler.execute);
    document.getElementById('clearBtn').addEventListener('click', FormulaCompiler.clear);
    
    // Table selection
    document.getElementById('tableSelect').addEventListener('change', (e) => {
        AppState.currentTable = e.target.value;
    });
    
    // Schema table selection
    document.getElementById('schemaTableSelect').addEventListener('change', (e) => {
        loadSchemaDetails(e.target.value);
    });
    
    // Formula input - Enter key handling
    document.getElementById('formulaInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            FormulaCompiler.execute();
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
                    <strong>${rel.relationship_name}</strong> → ${rel.target_table_name}
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
                    <strong>${rel.relationship_name}</strong> ← ${rel.source_table_name}
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

// =============================================================================
// EXAMPLES (CLIENT-SIDE)
// =============================================================================

async function loadExamples() {
    // For now, show a placeholder - we could load examples from a JSON file
    // or embed them directly in the client
    const examplesList = document.getElementById('examplesList');
    if (examplesList) {
        examplesList.innerHTML = `
            <div class="examples-placeholder">
                <h3>📝 Example Formulas</h3>
                <p>Client-side examples coming soon!</p>
                <p>For now, try these basic formulas:</p>
                <ul>
                    <li><code>UPPER(name)</code> - Convert name to uppercase</li>
                    <li><code>IF(amount > 1000, "High", "Low")</code> - Conditional logic</li>
                    <li><code>SUM(opportunities_rel, amount)</code> - Sum related records</li>
                </ul>
            </div>
        `;
    }
}

// =============================================================================
// MAKE GLOBAL FOR HTML EVENT HANDLERS
// =============================================================================

window.FormulaCompiler = FormulaCompiler;
window.RecentFormulas = RecentFormulas;
window.UI = UI;
window.loadSchemaDetails = loadSchemaDetails;