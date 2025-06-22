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

// Export for ES modules
export { TokenType };