#!/bin/bash

# VSCode Extension Local Installation Script
# Installs the Formula language extension for local development

set -e

echo "🚀 Installing Formula Language VSCode Extension locally..."

# Get the VSCode extensions directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    VSCODE_EXTENSIONS_DIR="$HOME/.vscode/extensions"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    VSCODE_EXTENSIONS_DIR="$HOME/.vscode/extensions"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
    # Windows Git Bash or Cygwin
    VSCODE_EXTENSIONS_DIR="$HOME/.vscode/extensions"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

# Create extensions directory if it doesn't exist
mkdir -p "$VSCODE_EXTENSIONS_DIR"

# Define extension directory name
EXTENSION_NAME="formula-language-support-1.0.0"
EXTENSION_DIR="$VSCODE_EXTENSIONS_DIR/$EXTENSION_NAME"

# Remove existing extension if it exists
if [ -d "$EXTENSION_DIR" ]; then
    echo "🗑️  Removing existing formula language extension..."
    rm -rf "$EXTENSION_DIR"
fi

# Copy extension files
echo "📁 Creating extension directory: $EXTENSION_DIR"
mkdir -p "$EXTENSION_DIR"

# Copy all extension files
cp -r vscode-extension/* "$EXTENSION_DIR/"

# Make sure the grammar file exists
if [ ! -f "$EXTENSION_DIR/syntaxes/formula.tmGrammar.json" ]; then
    echo "❌ Grammar file not found. Make sure to run 'npm run vscode-extension' first."
    exit 1
fi

echo "✅ Formula Language VSCode Extension installed successfully!"
echo "📁 Extension location: $EXTENSION_DIR"
echo ""
echo "🔄 Please restart VSCode to activate the extension."
echo "📝 The extension provides syntax highlighting for .formula files."
echo ""
echo "To test the extension:"
echo "1. Create a new file with .formula extension"
echo "2. Write some formula code like: TODAY() + 30"
echo "3. Check that syntax highlighting is working"
echo ""
echo "To uninstall, simply delete: $EXTENSION_DIR"