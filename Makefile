# JavaScript-to-SQL Formula Compiler Makefile

.PHONY: help test generate-docs vscode-extension install-vscode-extension clean

# Default target
help:
	@echo "Available targets:"
	@echo "  test                    - Run all tests"
	@echo "  vscode-extension        - Generate VSCode extension grammar"
	@echo "  install-vscode-extension - Install VSCode extension locally"
	@echo "  clean                   - Clean generated files"
	@echo "  help                    - Show this help message"

# Run test suite
test:
	npm test

# Generate VSCode extension TextMate grammar
vscode-extension:
	@echo "🎨 Generating VSCode TextMate Grammar..."
	node scripts/generate-vscode-grammar.js
	@echo "✅ VSCode extension grammar generated successfully!"
	@echo ""
	@echo "📁 Extension structure:"
	@ls -la vscode-extension/
	@echo ""
	@echo "🚀 To install locally, run: make install-vscode-extension"

# Install VSCode extension locally for development
install-vscode-extension: vscode-extension
	@echo "🔧 Installing VSCode extension locally..."
	@if [ -d "$(HOME)/.vscode/extensions" ]; then \
		rm -rf "$(HOME)/.vscode/extensions/formula-language-support-1.0.0"; \
		cp -r vscode-extension "$(HOME)/.vscode/extensions/formula-language-support-1.0.0"; \
		echo "✅ Extension installed to: $(HOME)/.vscode/extensions/formula-language-support-1.0.0"; \
		echo ""; \
		echo "🎯 Next steps:"; \
		echo "  1. Restart VSCode"; \
		echo "  2. Open or create a .formula file"; \
		echo "  3. Enjoy syntax highlighting!"; \
	else \
		echo "❌ VSCode extensions directory not found: $(HOME)/.vscode/extensions"; \
		echo "   Please make sure VSCode is installed and has been run at least once."; \
		exit 1; \
	fi

# Clean generated files
clean:
	@echo "🧹 Cleaning generated files..."
	rm -f vscode-extension/syntaxes/formula.tmGrammar.json
	@echo "✅ Clean complete!"