/**
 * Fix for Relationship Navigation Schema Structure
 * This script can be added to fix the schema structure issue
 */

// Fix the findRelationshipInTable method to handle both 'relationships' and 'directRelationships'
const fixLSPSchemaCompatibility = `
// Add this to the LSP class or patch it
findRelationshipInTable(tableName, relationshipName) {
  if (!this.schema || !this.schema[tableName]) return null;
  
  // Try directRelationships first (new format)
  let relationships = this.schema[tableName].directRelationships;
  
  // Fall back to relationships (old format) 
  if (!relationships) {
    relationships = this.schema[tableName].relationships;
  }
  
  if (!relationships) return null;
  
  return relationships.find(rel => 
    rel.relationship_name.toLowerCase() === relationshipName.toLowerCase()
  );
}

// Also fix getRelationshipCompletions method
getRelationshipCompletions(tableName, prefix = '', useMonacoFormat = true) {
  if (!this.schema || !this.schema[tableName]) {
    return [];
  }

  const completions = [];
  const upperPrefix = prefix.toUpperCase();
  
  // Try directRelationships first (new format)
  let relationships = this.schema[tableName].directRelationships;
  
  // Fall back to relationships (old format)
  if (!relationships) {
    relationships = this.schema[tableName].relationships;
  }
  
  if (!relationships) return [];

  relationships.forEach(rel => {
    const relName = \`\${rel.relationship_name}_rel\`;
    const upperRelName = relName.toUpperCase();
    
    if (upperRelName.startsWith(upperPrefix) || upperRelName.includes(upperPrefix)) {
      if (useMonacoFormat) {
        completions.push({
          label: relName,
          kind: CompletionItemKind.RELATIONSHIP,
          detail: \`→ \${rel.target_table_name}\`,
          documentation: {
            value: \`**Relationship:** \\\`\${rel.relationship_name}\\\`\\n\\n**Target:** \\\`\${rel.target_table_name}\\\`\\n\\n**Usage:** Access fields from related \${rel.target_table_name} records\`
          },
          insertText: \`\${relName}.\`,
          sortText: \`2_\${relName}\`,
          filterText: relName,
          range: null
        });
      } else {
        completions.push({
          label: relName,
          kind: CompletionItemKindString.RELATIONSHIP,
          detail: \`→ \${rel.target_table_name}\`,
          documentation: \`Relationship to \${rel.target_table_name} table\`,
          insertText: \`\${relName}.\`,
          sortText: \`2_\${relName}\`
        });
      }
    }
  });

  return completions;
}
`;

console.log('📋 LSP Schema Compatibility Fix:');
console.log(fixLSPSchemaCompatibility);
