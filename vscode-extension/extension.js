/**
 * Formula Language VSCode Extension
 */

const vscode = require('vscode');

/**
 * Extension activation function
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Formula Language extension is now active!');
    
    // Register any commands or providers here if needed in the future
    // For now, we only provide syntax highlighting via the grammar file
}

/**
 * Extension deactivation function
 */
function deactivate() {
    console.log('Formula Language extension deactivated');
}

module.exports = {
    activate,
    deactivate
};