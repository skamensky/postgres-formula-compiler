// Token types
const TokenType = {
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION: 'FUNCTION',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  AMPERSAND: 'AMPERSAND',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  STRING: 'STRING',
  DOT: 'DOT',
  GT: 'GT',           // >
  GTE: 'GTE',         // >=
  LT: 'LT',           // <
  LTE: 'LTE',         // <=
  EQ: 'EQ',           // =
  NEQ: 'NEQ',         // != or <>
  AND: 'AND',         // AND
  OR: 'OR',           // OR
  NOT: 'NOT',         // NOT
  EOF: 'EOF'
};

// AST Node types
const NodeType = {
  BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP',
  NUMBER: 'NUMBER',
  IDENTIFIER: 'IDENTIFIER',
  FUNCTION_CALL: 'FUNCTION_CALL',
  DATE_LITERAL: 'DATE_LITERAL',
  STRING_LITERAL: 'STRING_LITERAL',
  BOOLEAN_LITERAL: 'BOOLEAN_LITERAL',
  NULL_LITERAL: 'NULL_LITERAL',
  RELATIONSHIP_REF: 'RELATIONSHIP_REF'
};

// Export for ES modules
export { TokenType, NodeType };