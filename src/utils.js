/**
 * Map PostgreSQL data types to formula compiler types
 */
function mapPostgresType(pgType) {
  // Numeric types
  if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {
    return 'number';
  }
  
  // Date/timestamp types  
  if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {
    return 'date';
  }
  
  // Boolean type
  if (pgType === 'boolean') {
    return 'boolean';
  }
  
  // Everything else (text, varchar, etc.) as string
  return 'string';
}

// Export for ES modules
export { mapPostgresType };