/**
 * PostgreSQL Database Introspection Module
 * Uses standard PostgreSQL information_schema and system catalogs
 * for discovering table structures and relationships
 */

// Map PostgreSQL data types to JavaScript types
function mapPostgresType(pgType) {
  if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {
    return 'number';
  }
  
  if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {
    return 'date';
  }
  
  if (pgType === 'boolean') {
    return 'boolean';
  }
  
  return 'string';
}

// Get all table names from the database
async function getTableNames(client) {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  
  const result = await client.query(query);
  return result.rows.map(row => row.table_name);
}

// Get column information for multiple tables
async function getColumnListsForTables(tableNames, client) {
  if (tableNames.length === 0) {
    return {};
  }
  
  const query = `
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = ANY($1)
    ORDER BY table_name, ordinal_position
  `;
  
  const result = await client.query(query, [tableNames]);
  
  const columnLists = {};
  
  // Initialize empty objects for all requested tables
  for (const tableName of tableNames) {
    columnLists[tableName] = {};
  }
  
  // Populate column lists from results
  for (const row of result.rows) {
    columnLists[row.table_name][row.column_name] = mapPostgresType(row.data_type);
  }
  
  // Check if any tables were not found
  for (const tableName of tableNames) {
    if (Object.keys(columnLists[tableName]).length === 0) {
      throw new Error(`Table '${tableName}' not found in database`);
    }
  }
  
  return columnLists;
}

// Get column list for a single table (compatibility wrapper)
async function getColumnListForTable(tableName, client) {
  const columnLists = await getColumnListsForTables([tableName], client);
  return columnLists[tableName];
}

// Get foreign key relationships from the database
async function getAllRelationships(client) {
  const query = `
    SELECT 
      tc.table_name as source_table,
      kcu.column_name as source_column,
      ccu.table_name as target_table,
      ccu.column_name as target_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `;
  
  const result = await client.query(query);
  const relationships = [];
  
  for (const row of result.rows) {
    // Use the full column name as the relationship name (matching frontend behavior)
    // This ensures compatibility between frontend and command-line tools
    const relationshipName = row.source_column;
    
    relationships.push({
      name: relationshipName,
      fromTable: row.source_table,
      toTable: row.target_table,
      joinColumn: row.source_column
    });
  }
  
  return relationships;
}

// Get relationships for a specific table
async function getRelationshipsForTable(tableName, client) {
  const allRelationships = await getAllRelationships(client);
  return allRelationships.filter(rel => rel.fromTable === tableName);
}

// Build inverse relationship info for multiple tables using introspection
async function getInverseRelationshipsForTables(tableNames, client) {
  if (tableNames.length === 0) {
    return {};
  }
  
  // Get all relationships where target table is in our list
  const allRelationships = await getAllRelationships(client);
  const inverseRelationships = allRelationships.filter(rel => 
    tableNames.includes(rel.toTable)
  );
  
  // Get column lists for all tables we'll need
  const allTablesNeeded = new Set([
    ...tableNames,
    ...inverseRelationships.map(rel => rel.fromTable),
    ...allRelationships.map(rel => rel.toTable)
  ]);
  
  const columnLists = await getColumnListsForTables([...allTablesNeeded], client);
  
  // Build relationship maps for building nested structures
  const relationshipsByTable = new Map();
  for (const rel of allRelationships) {
    if (!relationshipsByTable.has(rel.fromTable)) {
      relationshipsByTable.set(rel.fromTable, []);
    }
    relationshipsByTable.get(rel.fromTable).push(rel);
  }
  
  // Build inverse relationships for all requested tables
  const result = {};
  for (const tableName of tableNames) {
    result[tableName] = {};
  }
  
  for (const rel of inverseRelationships) {
    const targetTable = rel.toTable;
    const sourceTable = rel.fromTable;
    
    // Use naming pattern: {source_table_name}s_{source_column}
    const relationshipName = `${sourceTable}s_${rel.joinColumn}`;
    
    const sourceColumnList = columnLists[sourceTable];
    const sourceRelationships = relationshipsByTable.get(sourceTable) || [];
    
    // Convert flat relationships to old nested format for backward compatibility
    const nestedRelationshipInfo = {};
    for (const sourceRel of sourceRelationships) {
      const targetColumnList = columnLists[sourceRel.toTable];
      if (targetColumnList) {
        nestedRelationshipInfo[sourceRel.name] = {
          joinColumn: sourceRel.joinColumn,
          columnList: targetColumnList,
          tableName: sourceRel.toTable
        };
      }
    }
    
    result[targetTable][relationshipName] = {
      tableName: sourceTable,
      columnList: sourceColumnList,
      joinColumn: rel.joinColumn,
      relationshipInfo: nestedRelationshipInfo
    };
  }
  
  return result;
}

// Get inverse relationships for a single table (compatibility wrapper)
async function getInverseRelationshipsForTable(tableName, client) {
  const allInverseRelationships = await getInverseRelationshipsForTables([tableName], client);
  return allInverseRelationships[tableName] || {};
}

export {
  mapPostgresType,
  getTableNames,
  getColumnListsForTables,
  getColumnListForTable,
  getAllRelationships,
  getRelationshipsForTable,
  getInverseRelationshipsForTables,
  getInverseRelationshipsForTable
};