# Core Functions


## ME

**Signature:** `ME()`  
**Returns:** [string](../types.md#string)  
**Description:** Returns the current user identifier

**Arguments:** None


<details>
<summary><strong>Test References</strong> (7 found)</summary>

- **core-functions.test.js** (7 references)
  - [Line 3](../../tests/core-functions.test.js#L3): `* Tests for TODAY(), ME(), DATE() functions`
  - [Line 16](../../tests/core-functions.test.js#L16): `// Test 9: ME() function`
  - [Line 17](../../tests/core-functions.test.js#L17): `test('ME() function', () => {`
  - [Line 18](../../tests/core-functions.test.js#L18): `const result = evaluateFormula('ME()', testContext);`
  - [Line 54](../../tests/core-functions.test.js#L54): `test('ME() with arguments error', () => {`
  - [Line 56](../../tests/core-functions.test.js#L56): `() => evaluateFormula('ME(42)', testContext),`
  - [Line 58](../../tests/core-functions.test.js#L58): `'Should throw error when ME() has arguments'`
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>

---

## STRING

**Signature:** `STRING(value)`  
**Returns:** [string](../types.md#string)  
**Description:** Converts a value to a string

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to convert to string


<details>
<summary><strong>Test References</strong> (27 found)</summary>

- **aggregate-functions.test.js** (2 references)
  - [Line 294](../../tests/aggregate-functions.test.js#L294): `const result = evaluateFormula('"Total: " & STRING(SUM_AGG(rep_links_submission, commission_percentage))', relationshipContext);`
  - [Line 311](../../tests/aggregate-functions.test.js#L311): `const result = evaluateFormula('"Total reps: " & STRING(COUNT_AGG(submissions_merchant.rep_links_submission, rep_rel.id))', relationshipContext);`

- **core-functions.test.js** (1 reference)
  - [Line 41](../../tests/core-functions.test.js#L41): `const result = evaluateFormula('STRING(revenue) & " on " & STRING(TODAY())', testContext);`

- **date-functions.test.js** (1 reference)
  - [Line 114](../../tests/date-functions.test.js#L114): `const result = evaluateFormula('STRING(YEAR(created_date)) & "-" & STRING(MONTH(created_date))', testContext);`

- **math-functions.test.js** (1 reference)
  - [Line 108](../../tests/math-functions.test.js#L108): `const result = evaluateFormula('STRING(ROUND(revenue, 2)) & " (max with cost: " & STRING(MAX(revenue, cost)) & ")"', testContext);`

- **null-handling.test.js** (2 references)
  - [Line 48](../../tests/null-handling.test.js#L48): `const result = evaluateFormula('NULLVALUE(note, "Empty") & " - " & STRING(amount)', testContext);`
  - [Line 164](../../tests/null-handling.test.js#L164): `const result = evaluateFormula('STRING(NULLVALUE(revenue, 0)) & " (empty: " & STRING(ISBLANK(revenue)) & ")"', testContext);`

- **parentheses-precedence.test.js** (1 reference)
  - [Line 48](../../tests/parentheses-precedence.test.js#L48): `const result = evaluateFormula('STRING((revenue + cost))', testContext);`

- **string-functions-concatenation.test.js** (19 references)
  - [Line 3](../../tests/string-functions-concatenation.test.js#L3): `* Tests for STRING() function and string concatenation with &`
  - [Line 10](../../tests/string-functions-concatenation.test.js#L10): `// Test 47: STRING() function with number`
  - [Line 11](../../tests/string-functions-concatenation.test.js#L11): `test('STRING() function with number', () => {`
  - [Line 12](../../tests/string-functions-concatenation.test.js#L12): `const result = evaluateFormula('STRING(42)', testContext);`
  - [Line 16](../../tests/string-functions-concatenation.test.js#L16): `// Test 48: STRING() function with column`
  - [Line 17](../../tests/string-functions-concatenation.test.js#L17): `test('STRING() function with column', () => {`
  - [Line 18](../../tests/string-functions-concatenation.test.js#L18): `const result = evaluateFormula('STRING(revenue)', testContext);`
  - [Line 28](../../tests/string-functions-concatenation.test.js#L28): `// Test 50: Mixed type string concatenation with STRING() function`
  - [Line 29](../../tests/string-functions-concatenation.test.js#L29): `test('Mixed type string concatenation with STRING() function', () => {`
  - [Line 30](../../tests/string-functions-concatenation.test.js#L30): `const result = evaluateFormula('"Revenue: " & STRING(revenue)', testContext);`
  - [Line 34](../../tests/string-functions-concatenation.test.js#L34): `// Test 55: Correct usage with STRING() function for concatenation`
  - [Line 35](../../tests/string-functions-concatenation.test.js#L35): `test('Correct usage with STRING() function for concatenation', () => {`
  - [Line 36](../../tests/string-functions-concatenation.test.js#L36): `const result = evaluateFormula('STRING(revenue) & " dollars"', testContext);`
  - [Line 57](../../tests/string-functions-concatenation.test.js#L57): `test('STRING() function error - no arguments', () => {`
  - [Line 59](../../tests/string-functions-concatenation.test.js#L59): `() => evaluateFormula('STRING()', testContext),`
  - [Line 61](../../tests/string-functions-concatenation.test.js#L61): `'Should throw error when STRING() has no arguments'`
  - [Line 65](../../tests/string-functions-concatenation.test.js#L65): `test('STRING() function error - multiple arguments', () => {`
  - [Line 67](../../tests/string-functions-concatenation.test.js#L67): `() => evaluateFormula('STRING(revenue, cost)', testContext),`
  - [Line 69](../../tests/string-functions-concatenation.test.js#L69): `'Should throw error when STRING() has multiple arguments'`
</details>

<details>
<summary><strong>Usage Examples</strong> (3 found)</summary>

- **examples/table/submission/README.md** (1 reference)
  - [Line 60](../../examples/table/submission/README.md#L60): `- **Conversion**: STRING (for type casting)`

- **src/compiler.js** (1 reference)
  - [Line 320](../../src/compiler.js#L320): `this.error(`String concatenation operator & requires both operands to be strings, got ${typeToString(left.returnType)} and ${typeToString(right.returnType)}. Use STRING() function to cast values to strings.`, node.position);`

- **src/types-unified.js** (1 reference)
  - [Line 258](../../src/types-unified.js#L258): `'- Type conversion functions like `STRING(expression)`'`
</details>

---

## DATE

**Signature:** `DATE(dateString)`  
**Returns:** [date](../types.md#date)  
**Description:** Creates a date from a string literal

**Arguments:**
- `dateString` ([string literal](../types.md#string-literal)): Date string in ISO format


<details>
<summary><strong>Test References</strong> (24 found)</summary>

- **comparison-operators.test.js** (2 references)
  - [Line 66](../../tests/comparison-operators.test.js#L66): `const result = evaluateFormula('created_date > DATE("2023-01-01")', testContext);`
  - [Line 67](../../tests/comparison-operators.test.js#L67): `assertEqual(result, '("s"."created_date" > DATE(\'2023-01-01\'))');`

- **core-functions.test.js** (11 references)
  - [Line 3](../../tests/core-functions.test.js#L3): `* Tests for TODAY(), ME(), DATE() functions`
  - [Line 22](../../tests/core-functions.test.js#L22): `// Test 10: DATE() function with string literal`
  - [Line 23](../../tests/core-functions.test.js#L23): `test('DATE() function with string literal', () => {`
  - [Line 24](../../tests/core-functions.test.js#L24): `const result = evaluateFormula('DATE("2023-01-01")', testContext);`
  - [Line 25](../../tests/core-functions.test.js#L25): `assertEqual(result, 'DATE(\'2023-01-01\')');`
  - [Line 62](../../tests/core-functions.test.js#L62): `test('DATE() without arguments error', () => {`
  - [Line 64](../../tests/core-functions.test.js#L64): `() => evaluateFormula('DATE()', testContext),`
  - [Line 66](../../tests/core-functions.test.js#L66): `'Should throw error when DATE() has no arguments'`
  - [Line 70](../../tests/core-functions.test.js#L70): `test('DATE() with non-string argument error', () => {`
  - [Line 72](../../tests/core-functions.test.js#L72): `() => evaluateFormula('DATE(42)', testContext),`
  - [Line 74](../../tests/core-functions.test.js#L74): `'Should throw error when DATE() has non-string argument'`

- **date-functions.test.js** (10 references)
  - [Line 22](../../tests/date-functions.test.js#L22): `// Test 226: YEAR function with DATE() literal`
  - [Line 23](../../tests/date-functions.test.js#L23): `test('YEAR function with DATE() literal', () => {`
  - [Line 24](../../tests/date-functions.test.js#L24): `const result = evaluateFormula('YEAR(DATE("2023-12-25"))', testContext);`
  - [Line 25](../../tests/date-functions.test.js#L25): `assertEqual(result, 'EXTRACT(YEAR FROM DATE(\'2023-12-25\'))');`
  - [Line 46](../../tests/date-functions.test.js#L46): `// Test 230: DAY function with DATE() literal`
  - [Line 47](../../tests/date-functions.test.js#L47): `test('DAY function with DATE() literal', () => {`
  - [Line 48](../../tests/date-functions.test.js#L48): `const result = evaluateFormula('DAY(DATE("2023-12-25"))', testContext);`
  - [Line 49](../../tests/date-functions.test.js#L49): `assertEqual(result, 'EXTRACT(DAY FROM DATE(\'2023-12-25\'))');`
  - [Line 102](../../tests/date-functions.test.js#L102): `const result = evaluateFormula('DATEDIF(DATE("2020-01-01"), TODAY(), "years")', testContext);`
  - [Line 103](../../tests/date-functions.test.js#L103): `assertEqual(result, '(EXTRACT(YEAR FROM current_date) - EXTRACT(YEAR FROM DATE(\'2020-01-01\')))');`

- **error-handling-basic.test.js** (1 reference)
  - [Line 58](../../tests/error-handling-basic.test.js#L58): `() => evaluateFormula('DATE("2023-01-01)', testContext),`
</details>

<details>
<summary><strong>Usage Examples</strong> (10 found)</summary>

- **src/function-metadata.js** (6 references)
  - [Line 545](../../src/function-metadata.js#L545): `description: 'Returns the current date (without time)',`
  - [Line 567](../../src/function-metadata.js#L567): `description: 'Extracts the month from a date (1-12)',`
  - [Line 579](../../src/function-metadata.js#L579): `description: 'Extracts the day from a date (1-31)',`
  - [Line 591](../../src/function-metadata.js#L591): `description: 'Extracts the hour from a date (0-23)',`
  - [Line 603](../../src/function-metadata.js#L603): `description: 'Extracts the minute from a date (0-59)',`
  - [Line 615](../../src/function-metadata.js#L615): `description: 'Extracts the second from a date (0-59)',`

- **src/functions/core-functions.js** (2 references)
  - [Line 85](../../src/functions/core-functions.js#L85): `compiler.error('DATE() takes exactly one argument', node.position);`
  - [Line 90](../../src/functions/core-functions.js#L90): `compiler.error('DATE() function requires a string literal', node.position);`

- **src/sql-generator.js** (1 reference)
  - [Line 644](../../src/sql-generator.js#L644): `return `DATE('${expr.value.stringValue}')`;`

- **src/types-unified.js** (1 reference)
  - [Line 228](../../src/types-unified.js#L228): `literals: 'Date literals are created using the `DATE()` function: `DATE("2023-12-25")`',`
</details>

---

## IF

**Signature:** `IF(condition, trueValue, falseValue)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns one value if condition is true, another if false

**Arguments:**
- `condition` ([boolean](../types.md#boolean)): Condition to evaluate
- `trueValue` ([expression](../types.md#expression)): Value to return if condition is true
- `falseValue` ([expression](../types.md#expression)): Value to return if condition is false


<details>
<summary><strong>Test References</strong> (64 found)</summary>

- **aggregate-functions.test.js** (13 references)
  - [Line 104](../../tests/aggregate-functions.test.js#L104): `const result = evaluateFormula('IF(SUM_AGG(rep_links_submission, commission_percentage) > 100, "High Commission", "Low Commission")', relationshipContext);`
  - [Line 131](../../tests/aggregate-functions.test.js#L131): `if (result.aggregateIntents[0].isMultiLevel) {`
  - [Line 136](../../tests/aggregate-functions.test.js#L136): `if (error.message.includes('Unknown inverse relationship in chain')) {`
  - [Line 150](../../tests/aggregate-functions.test.js#L150): `if (error.message.includes('Unknown inverse relationship in chain')) {`
  - [Line 164](../../tests/aggregate-functions.test.js#L164): `if (error.message.includes('Unknown inverse relationship in chain')) {`
  - [Line 181](../../tests/aggregate-functions.test.js#L181): `if (error.message.includes('Multi-level aggregate chain too deep') ||`
  - [Line 193](../../tests/aggregate-functions.test.js#L193): `const result = evaluateFormula('IF(SUM_AGG(submissions_merchant.rep_links_submission, commission_percentage) > 100, "High", "Low")', relationshipContext);`
  - [Line 197](../../tests/aggregate-functions.test.js#L197): `if (error.message.includes('Unknown inverse relationship in chain')) {`
  - [Line 211](../../tests/aggregate-functions.test.js#L211): `if (error.message.includes('Unknown inverse relationship in chain') || error.message.includes('Multi-level aggregate chain too deep')) {`
  - [Line 281](../../tests/aggregate-functions.test.js#L281): `if (error.message.includes('Unknown inverse relationship') || error.message.includes('chain')) {`
  - [Line 315](../../tests/aggregate-functions.test.js#L315): `if (error.message.includes('Unknown inverse relationship')) {`
  - [Line 329](../../tests/aggregate-functions.test.js#L329): `if (error.message.includes('Unknown inverse relationship')) {`
  - [Line 342](../../tests/aggregate-functions.test.js#L342): `if (error.message.includes('Unknown inverse relationship')) {`

- **basic-arithmetic-literals.test.js** (1 reference)
  - [Line 103](../../tests/basic-arithmetic-literals.test.js#L103): `if (!success) {`

- **boolean-literals.test.js** (1 reference)
  - [Line 50](../../tests/boolean-literals.test.js#L50): `if (!success) {`

- **comments.test.js** (1 reference)
  - [Line 56](../../tests/comments.test.js#L56): `if (!success) {`

- **comparison-operators.test.js** (1 reference)
  - [Line 113](../../tests/comparison-operators.test.js#L113): `if (!success) {`

- **compiler-modularization.test.js** (10 references)
  - [Line 22](../../tests/compiler-modularization.test.js#L22): `if (actual !== expected) {`
  - [Line 27](../../tests/compiler-modularization.test.js#L27): `if (!pattern.test(actual)) {`
  - [Line 32](../../tests/compiler-modularization.test.js#L32): `if (actual.length !== expected) {`
  - [Line 38](../../tests/compiler-modularization.test.js#L38): `if (actual === expected) {`
  - [Line 44](../../tests/compiler-modularization.test.js#L44): `if (actual >= expected) {`
  - [Line 57](../../tests/compiler-modularization.test.js#L57): `if (!threw) {`
  - [Line 60](../../tests/compiler-modularization.test.js#L60): `if (pattern && !pattern.test(error.message)) {`
  - [Line 140](../../tests/compiler-modularization.test.js#L140): `const result = evaluateFormula('IF(amount > 100, merchant_rel.name & " (high)", "low")', baseContext);`
  - [Line 239](../../tests/compiler-modularization.test.js#L239): `complex_calc: evaluateFormula('IF(amount > 100, merchant_rel.name & " - " & STRING_AGG(rep_links, rep_rel.name, ", "), "simple")', baseContext)`
  - [Line 274](../../tests/compiler-modularization.test.js#L274): `if (passedTests === totalTests) {`

- **core-functions.test.js** (1 reference)
  - [Line 88](../../tests/core-functions.test.js#L88): `if (!success) {`

- **date-arithmetic.test.js** (1 reference)
  - [Line 59](../../tests/date-arithmetic.test.js#L59): `if (!success) {`

- **date-functions.test.js** (1 reference)
  - [Line 272](../../tests/date-functions.test.js#L272): `if (!success) {`

- **error-handling-basic.test.js** (1 reference)
  - [Line 147](../../tests/error-handling-basic.test.js#L147): `if (!success) {`

- **if-function.test.js** (23 references)
  - [Line 3](../../tests/if-function.test.js#L3): `* Tests for IF() function with boolean conditions`
  - [Line 12](../../tests/if-function.test.js#L12): `const result = evaluateFormula('IF(closed, "Yes", "No")', testContext);`
  - [Line 18](../../tests/if-function.test.js#L18): `const result = evaluateFormula('IF(syndication, amount)', testContext);`
  - [Line 24](../../tests/if-function.test.js#L24): `const result = evaluateFormula('IF(open_approval, amount, 0)', testContext);`
  - [Line 30](../../tests/if-function.test.js#L30): `const result = evaluateFormula('IF(closed, merchant_rel.business_name, "Pending")', relationshipContext);`
  - [Line 36](../../tests/if-function.test.js#L36): `const result = evaluateFormula('IF(revenue > 1000, "High", "Low")', testContext);`
  - [Line 42](../../tests/if-function.test.js#L42): `const result = evaluateFormula('IF(AND(revenue > 1000, cost < 500), "Good Deal", "Check Again")', testContext);`
  - [Line 48](../../tests/if-function.test.js#L48): `const result = evaluateFormula('IF(TRUE, "yes", "no")', testContext);`
  - [Line 54](../../tests/if-function.test.js#L54): `const result = evaluateFormula('IF(CONTAINS("hello world", "world"), "Found", "Not found")', testContext);`
  - [Line 60](../../tests/if-function.test.js#L60): `const result = evaluateFormula('IF(CONTAINS("Company LLC", "LLC"), SUBSTITUTE("Company LLC", "LLC", "Limited"), "No change")', testContext);`
  - [Line 66](../../tests/if-function.test.js#L66): `const result = evaluateFormula('IF(ABS(revenue - cost) > 1000, "Large difference", "Small difference")', testContext);`
  - [Line 72](../../tests/if-function.test.js#L72): `const result = evaluateFormula('IF(ISNULL(revenue), "No revenue", "Has revenue")', testContext);`
  - [Line 78](../../tests/if-function.test.js#L78): `const result = evaluateFormula('IF(TRUE, "always true", "never false")', testContext);`
  - [Line 84](../../tests/if-function.test.js#L84): `const result = evaluateFormula('IF(YEAR(created_date) = 2023, "This year", "Other year")', testContext);`
  - [Line 91](../../tests/if-function.test.js#L91): `() => evaluateFormula('IF()', testContext),`
  - [Line 93](../../tests/if-function.test.js#L93): `'Should throw error when IF() has no arguments'`
  - [Line 99](../../tests/if-function.test.js#L99): `() => evaluateFormula('IF(closed, "A", "B", "C")', testContext),`
  - [Line 101](../../tests/if-function.test.js#L101): `'Should throw error when IF() has too many arguments'`
  - [Line 107](../../tests/if-function.test.js#L107): `() => evaluateFormula('IF(revenue, "Yes", "No")', testContext),`
  - [Line 109](../../tests/if-function.test.js#L109): `'Should throw error when IF() condition is not boolean'`
  - [Line 115](../../tests/if-function.test.js#L115): `() => evaluateFormula('IF(closed, amount, "text")', testContext),`
  - [Line 117](../../tests/if-function.test.js#L117): `'Should throw error when IF() true and false values have different types'`
  - [Line 123](../../tests/if-function.test.js#L123): `if (!success) {`

- **math-functions.test.js** (1 reference)
  - [Line 242](../../tests/math-functions.test.js#L242): `if (!success) {`

- **multi-level-relationships.test.js** (1 reference)
  - [Line 129](../../tests/multi-level-relationships.test.js#L129): `const result = evaluateFormula('IF(ISNULL(merchant_rel.main_rep_rel.user_rel.status), "No Status", merchant_rel.main_rep_rel.user_rel.status)', multiLevelContext);`

- **multiplication-division.test.js** (1 reference)
  - [Line 77](../../tests/multiplication-division.test.js#L77): `if (!success) {`

- **null-handling.test.js** (3 references)
  - [Line 53](../../tests/null-handling.test.js#L53): `const result = evaluateFormula('IF(ISNULL(note), "No note", note)', testContext);`
  - [Line 149](../../tests/null-handling.test.js#L149): `const result = evaluateFormula('IF(ISBLANK(revenue), NULLVALUE(cost, 0), revenue)', testContext);`
  - [Line 170](../../tests/null-handling.test.js#L170): `if (!success) {`

- **parentheses-precedence.test.js** (1 reference)
  - [Line 115](../../tests/parentheses-precedence.test.js#L115): `if (!success) {`

- **relationships.test.js** (1 reference)
  - [Line 56](../../tests/relationships.test.js#L56): `if (!success) {`

- **string-functions-concatenation.test.js** (1 reference)
  - [Line 91](../../tests/string-functions-concatenation.test.js#L91): `if (!success) {`

- **text-functions.test.js** (1 reference)
  - [Line 289](../../tests/text-functions.test.js#L289): `if (!success) {`
</details>

<details>
<summary><strong>Usage Examples</strong> (210 found)</summary>

- **src/compiler.js** (13 references)
  - [Line 74](../../src/compiler.js#L74): `if (this.context.columnList) {`
  - [Line 79](../../src/compiler.js#L79): `} else if (this.context.tableInfos) {`
  - [Line 82](../../src/compiler.js#L82): `if (primaryTable && primaryTable.columnList) {`
  - [Line 99](../../src/compiler.js#L99): `if (!(upperName in this.columnList)) {`
  - [Line 129](../../src/compiler.js#L129): `if (childIds.length === 0) {`
  - [Line 209](../../src/compiler.js#L209): `if (columnType === null) {`
  - [Line 230](../../src/compiler.js#L230): `if (operand.returnType !== TYPE.NUMBER) {`
  - [Line 297](../../src/compiler.js#L297): `if (!operationRule && operation === OPERATION.PLUS &&`
  - [Line 300](../../src/compiler.js#L300): `if (left.type === TYPE.NUMBER_LITERAL || left.type === TYPE.IDENTIFIER) {`
  - [Line 303](../../src/compiler.js#L303): `if (reverseRule) {`
  - [Line 317](../../src/compiler.js#L317): `if (!operationRule) {`
  - [Line 319](../../src/compiler.js#L319): `if (operation === OPERATION.CONCATENATE) {`
  - [Line 321](../../src/compiler.js#L321): `} else if (operation === OPERATION.GREATER_THAN || operation === OPERATION.GREATER_THAN_EQUAL ||`

- **src/function-dispatcher.js** (7 references)
  - [Line 28](../../src/function-dispatcher.js#L28): `if (result) return result;`
  - [Line 32](../../src/function-dispatcher.js#L32): `if (result) return result;`
  - [Line 36](../../src/function-dispatcher.js#L36): `if (result) return result;`
  - [Line 40](../../src/function-dispatcher.js#L40): `if (result) return result;`
  - [Line 44](../../src/function-dispatcher.js#L44): `if (result) return result;`
  - [Line 48](../../src/function-dispatcher.js#L48): `if (result) return result;`
  - [Line 52](../../src/function-dispatcher.js#L52): `if (result) return result;`

- **src/function-metadata.js** (18 references)
  - [Line 1057](../../src/function-metadata.js#L1057): `if (!metadata) {`
  - [Line 1063](../../src/function-metadata.js#L1063): `if (!metadata.variadic) {`
  - [Line 1065](../../src/function-metadata.js#L1065): `if (args.length < metadata.minArgs || (metadata.maxArgs !== null && args.length > metadata.maxArgs)) {`
  - [Line 1068](../../src/function-metadata.js#L1068): `if (metadata.minArgs === 0 && metadata.maxArgs === 0) {`
  - [Line 1070](../../src/function-metadata.js#L1070): `} else if (metadata.minArgs === metadata.maxArgs) {`
  - [Line 1072](../../src/function-metadata.js#L1072): `if (metadata.minArgs === 1) {`
  - [Line 1088](../../src/function-metadata.js#L1088): `if (args.length < metadata.minArgs) {`
  - [Line 1090](../../src/function-metadata.js#L1090): `if (metadata.minArgs === 1) {`
  - [Line 1101](../../src/function-metadata.js#L1101): `if (metadata.specialHandling) {`
  - [Line 1112](../../src/function-metadata.js#L1112): `if (!expectedArg) {`
  - [Line 1121](../../src/function-metadata.js#L1121): `if (metadata.variadic) {`
  - [Line 1126](../../src/function-metadata.js#L1126): `if (expectedArg.type === TYPE.STRING_LITERAL && arg.type !== TYPE.STRING_LITERAL) {`
  - [Line 1128](../../src/function-metadata.js#L1128): `} else if (expectedArg.type === TYPE.BOOLEAN && argReturnType !== TYPE.BOOLEAN) {`
  - [Line 1129](../../src/function-metadata.js#L1129): `if (argName.startsWith('requires') || argName.startsWith('boolean argument')) {`
  - [Line 1134](../../src/function-metadata.js#L1134): `} else if (expectedArg.type === TYPE.NUMBER && argReturnType !== TYPE.NUMBER) {`
  - [Line 1136](../../src/function-metadata.js#L1136): `} else if (expectedArg.type === TYPE.STRING && argReturnType !== TYPE.STRING) {`
  - [Line 1137](../../src/function-metadata.js#L1137): `if (argName.startsWith('requires')) {`
  - [Line 1142](../../src/function-metadata.js#L1142): `} else if (expectedArg.type === TYPE.DATE && argReturnType !== TYPE.DATE) {`

- **src/functions/aggregate-functions.js** (19 references)
  - [Line 32](../../src/functions/aggregate-functions.js#L32): `if (parts.length === 1) {`
  - [Line 48](../../src/functions/aggregate-functions.js#L48): `if (relationshipChain.length === 1) {`
  - [Line 60](../../src/functions/aggregate-functions.js#L60): `if (relationshipChain.length > maxDepth) {`
  - [Line 73](../../src/functions/aggregate-functions.js#L73): `if (!matchingKey) {`
  - [Line 96](../../src/functions/aggregate-functions.js#L96): `if (i < relationshipChain.length - 1) {`
  - [Line 141](../../src/functions/aggregate-functions.js#L141): `if (!matchingKey) {`
  - [Line 170](../../src/functions/aggregate-functions.js#L170): `if (!metadata || metadata.category !== CATEGORIES.AGGREGATE) {`
  - [Line 175](../../src/functions/aggregate-functions.js#L175): `if (node.args.length < metadata.minArgs ||`
  - [Line 191](../../src/functions/aggregate-functions.js#L191): `if (relationshipArg.type === TYPE.IDENTIFIER) {`
  - [Line 193](../../src/functions/aggregate-functions.js#L193): `} else if (relationshipArg.type === TYPE.RELATIONSHIP_REF) {`
  - [Line 210](../../src/functions/aggregate-functions.js#L210): `if (resolvedChain.isMultiLevel) {`
  - [Line 218](../../src/functions/aggregate-functions.js#L218): `if (resolvedChain.finalContext.relationshipInfo) {`
  - [Line 228](../../src/functions/aggregate-functions.js#L228): `if (!subTableInfos.find(t => t.tableName === (relInfo.tableName || relName))) {`
  - [Line 252](../../src/functions/aggregate-functions.js#L252): `if (inverseRelInfo.relationshipInfo) {`
  - [Line 262](../../src/functions/aggregate-functions.js#L262): `if (!subTableInfos.find(t => t.tableName === (relInfo.tableName || relName))) {`
  - [Line 284](../../src/functions/aggregate-functions.js#L284): `if (resolvedChain.isMultiLevel) {`
  - [Line 297](../../src/functions/aggregate-functions.js#L297): `if (funcName === FUNCTIONS.STRING_AGG) {`
  - [Line 299](../../src/functions/aggregate-functions.js#L299): `if (delimiterResult.returnType !== TYPE.STRING) {`
  - [Line 309](../../src/functions/aggregate-functions.js#L309): `if (funcName === FUNCTIONS.COUNT_AGG) {`

- **src/functions/core-functions.js** (13 references)
  - [Line 26](../../src/functions/core-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.CORE) {`
  - [Line 31](../../src/functions/core-functions.js#L31): `if (funcName === FUNCTIONS.DATE) {`
  - [Line 35](../../src/functions/core-functions.js#L35): `if (funcName === FUNCTIONS.IF) {`
  - [Line 43](../../src/functions/core-functions.js#L43): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`
  - [Line 84](../../src/functions/core-functions.js#L84): `if (node.args.length !== 1) {`
  - [Line 89](../../src/functions/core-functions.js#L89): `if (dateArg.type !== TYPE.STRING_LITERAL) {`
  - [Line 111](../../src/functions/core-functions.js#L111): `if (node.args.length < 2 || node.args.length > 3) {`
  - [Line 112](../../src/functions/core-functions.js#L112): `compiler.error('IF() takes 2 or 3 arguments: IF(condition, true_value, false_value) or IF(condition, true_value)', node.position);`
  - [Line 119](../../src/functions/core-functions.js#L119): `if (node.args.length === 3) {`
  - [Line 122](../../src/functions/core-functions.js#L122): `if (trueValue.returnType !== falseValue.returnType) {`
  - [Line 123](../../src/functions/core-functions.js#L123): `compiler.error(`IF() true and false values must be the same type, got ${typeToString(trueValue.returnType)} and ${typeToString(falseValue.returnType)}`, node.position);`
  - [Line 127](../../src/functions/core-functions.js#L127): `if (condition.returnType !== TYPE.BOOLEAN) {`
  - [Line 128](../../src/functions/core-functions.js#L128): `compiler.error(`IF() condition must be boolean, got ${typeToString(condition.returnType)}`, node.position);`

- **src/functions/date-functions.js** (8 references)
  - [Line 26](../../src/functions/date-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.DATE) {`
  - [Line 31](../../src/functions/date-functions.js#L31): `if (funcName === FUNCTIONS.DATEDIF) {`
  - [Line 39](../../src/functions/date-functions.js#L39): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`
  - [Line 66](../../src/functions/date-functions.js#L66): `if (node.args.length !== 3) {`
  - [Line 75](../../src/functions/date-functions.js#L75): `if (datedifArg1.returnType !== TYPE.DATE) {`
  - [Line 78](../../src/functions/date-functions.js#L78): `if (datedifArg2.returnType !== TYPE.DATE) {`
  - [Line 83](../../src/functions/date-functions.js#L83): `if (node.args[2].type !== TYPE.STRING_LITERAL) {`
  - [Line 88](../../src/functions/date-functions.js#L88): `if (!['days', 'months', 'years'].includes(unit)) {`

- **src/functions/logical-functions.js** (2 references)
  - [Line 26](../../src/functions/logical-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.LOGICAL) {`
  - [Line 36](../../src/functions/logical-functions.js#L36): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`

- **src/functions/math-functions.js** (2 references)
  - [Line 26](../../src/functions/math-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.MATH) {`
  - [Line 34](../../src/functions/math-functions.js#L34): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`

- **src/functions/null-functions.js** (5 references)
  - [Line 26](../../src/functions/null-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.NULL_HANDLING) {`
  - [Line 31](../../src/functions/null-functions.js#L31): `if (funcName === FUNCTIONS.NULLVALUE) {`
  - [Line 39](../../src/functions/null-functions.js#L39): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`
  - [Line 62](../../src/functions/null-functions.js#L62): `if (node.args.length !== 2) {`
  - [Line 70](../../src/functions/null-functions.js#L70): `if (nullvalueArg1.returnType !== nullvalueArg2.returnType &&`

- **src/functions/string-functions.js** (2 references)
  - [Line 26](../../src/functions/string-functions.js#L26): `if (!metadata || metadata.category !== CATEGORIES.STRING) {`
  - [Line 34](../../src/functions/string-functions.js#L34): `if (!validateFunctionArgs(funcName, compiledArgs, compiler, node)) {`

- **src/lexer.js** (28 references)
  - [Line 65](../../src/lexer.js#L65): `if (this.position >= this.input.length) {`
  - [Line 89](../../src/lexer.js#L89): `if (this.currentChar === '\n') {`
  - [Line 101](../../src/lexer.js#L101): `if (this.currentChar === '*' && this.position + 1 < this.input.length && this.input[this.position + 1] === '/') {`
  - [Line 167](../../src/lexer.js#L167): `if (this.currentChar === null) {`
  - [Line 182](../../src/lexer.js#L182): `if (/\s/.test(this.currentChar)) {`
  - [Line 188](../../src/lexer.js#L188): `if (this.currentChar === '/') {`
  - [Line 189](../../src/lexer.js#L189): `if (this.position + 1 < this.input.length) {`
  - [Line 191](../../src/lexer.js#L191): `if (nextChar === '/') {`
  - [Line 194](../../src/lexer.js#L194): `} else if (nextChar === '*') {`
  - [Line 205](../../src/lexer.js#L205): `if (/\d/.test(this.currentChar)) {`
  - [Line 209](../../src/lexer.js#L209): `if (/[a-zA-Z_]/.test(this.currentChar)) {`
  - [Line 213](../../src/lexer.js#L213): `if (this.currentChar === '"') {`
  - [Line 219](../../src/lexer.js#L219): `if (this.currentChar === '+') {`
  - [Line 224](../../src/lexer.js#L224): `if (this.currentChar === '-') {`
  - [Line 229](../../src/lexer.js#L229): `if (this.currentChar === '(') {`
  - [Line 234](../../src/lexer.js#L234): `if (this.currentChar === ')') {`
  - [Line 239](../../src/lexer.js#L239): `if (this.currentChar === ',') {`
  - [Line 244](../../src/lexer.js#L244): `if (this.currentChar === '.') {`
  - [Line 249](../../src/lexer.js#L249): `if (this.currentChar === '&') {`
  - [Line 254](../../src/lexer.js#L254): `if (this.currentChar === '*') {`
  - [Line 259](../../src/lexer.js#L259): `if (this.currentChar === '>') {`
  - [Line 261](../../src/lexer.js#L261): `if (this.currentChar === '=') {`
  - [Line 268](../../src/lexer.js#L268): `if (this.currentChar === '<') {`
  - [Line 270](../../src/lexer.js#L270): `if (this.currentChar === '=') {`
  - [Line 273](../../src/lexer.js#L273): `} else if (this.currentChar === '>') {`
  - [Line 280](../../src/lexer.js#L280): `if (this.currentChar === '=') {`
  - [Line 285](../../src/lexer.js#L285): `if (this.currentChar === '!') {`
  - [Line 287](../../src/lexer.js#L287): `if (this.currentChar === '=') {`

- **src/parser.js** (29 references)
  - [Line 21](../../src/parser.js#L21): `if (this.currentToken.type === tokenType) {`
  - [Line 31](../../src/parser.js#L31): `if (token.type === TokenType.EOF) {`
  - [Line 35](../../src/parser.js#L35): `if (token.type === TokenType.PLUS) {`
  - [Line 39](../../src/parser.js#L39): `if (token.type === TokenType.MINUS) {`
  - [Line 44](../../src/parser.js#L44): `if (operand.type === TYPE.UNARY_OP) {`
  - [Line 56](../../src/parser.js#L56): `if (token.type === TokenType.NUMBER) {`
  - [Line 65](../../src/parser.js#L65): `if (token.type === TokenType.IDENTIFIER) {`
  - [Line 71](../../src/parser.js#L71): `if (identifier.endsWith('_REL') && this.currentToken.type === TokenType.DOT) {`
  - [Line 75](../../src/parser.js#L75): `if (this.currentToken.type === TokenType.LPAREN) {`
  - [Line 80](../../src/parser.js#L80): `if (this.currentToken.type !== TokenType.RPAREN) {`
  - [Line 84](../../src/parser.js#L84): `if (isAggregateFunction) {`
  - [Line 107](../../src/parser.js#L107): `if (identifier === LITERAL_VALUE.TRUE || identifier === LITERAL_VALUE.FALSE) {`
  - [Line 113](../../src/parser.js#L113): `} else if (identifier === LITERAL_VALUE.NULL) {`
  - [Line 130](../../src/parser.js#L130): `if (token.type === TokenType.STRING) {`
  - [Line 139](../../src/parser.js#L139): `if (token.type === TokenType.LPAREN) {`
  - [Line 156](../../src/parser.js#L156): `if (token.type === TokenType.MULTIPLY) {`
  - [Line 158](../../src/parser.js#L158): `} else if (token.type === TokenType.DIVIDE) {`
  - [Line 163](../../src/parser.js#L163): `if (this.currentToken.type === TokenType.MULTIPLY ||`
  - [Line 215](../../src/parser.js#L215): `if (token.type === TokenType.PLUS) {`
  - [Line 217](../../src/parser.js#L217): `} else if (token.type === TokenType.MINUS) {`
  - [Line 219](../../src/parser.js#L219): `} else if (token.type === TokenType.AMPERSAND) {`
  - [Line 224](../../src/parser.js#L224): `if (this.currentToken.type === TokenType.PLUS ||`
  - [Line 247](../../src/parser.js#L247): `if (this.currentToken.type !== TokenType.EOF) {`
  - [Line 260](../../src/parser.js#L260): `if (this.currentToken.type !== TokenType.IDENTIFIER) {`
  - [Line 269](../../src/parser.js#L269): `if (this.currentToken.type === TokenType.DOT) {`
  - [Line 276](../../src/parser.js#L276): `if (this.currentToken.type !== TokenType.IDENTIFIER) {`
  - [Line 319](../../src/parser.js#L319): `if (this.currentToken.type !== TokenType.IDENTIFIER) {`
  - [Line 328](../../src/parser.js#L328): `if (currentIdentifier.endsWith('_REL')) {`
  - [Line 332](../../src/parser.js#L332): `if (relationshipChain.length === 0) {`

- **src/relationship-compiler.js** (12 references)
  - [Line 33](../../src/relationship-compiler.js#L33): `if (relationshipChain.length > compiler.maxRelationshipDepth) {`
  - [Line 55](../../src/relationship-compiler.js#L55): `if (compiler.context.relationshipInfos) {`
  - [Line 64](../../src/relationship-compiler.js#L64): `if (compiler.context.tableInfos) {`
  - [Line 77](../../src/relationship-compiler.js#L77): `if (!relInfo) {`
  - [Line 112](../../src/relationship-compiler.js#L112): `if (!compiler.joinIntents.has(joinSemanticId)) {`
  - [Line 125](../../src/relationship-compiler.js#L125): `if (!finalTableInfo) {`
  - [Line 127](../../src/relationship-compiler.js#L127): `if (compiler.context.relationshipInfo) {`
  - [Line 130](../../src/relationship-compiler.js#L130): `if (fieldType) {`
  - [Line 156](../../src/relationship-compiler.js#L156): `if (!fieldType) {`
  - [Line 209](../../src/relationship-compiler.js#L209): `if (relationshipType === 'direct_relationship') {`
  - [Line 230](../../src/relationship-compiler.js#L230): `if (!currentRelationshipInfo || !currentRelationshipInfo[relationName]) {`
  - [Line 236](../../src/relationship-compiler.js#L236): `if (i === relationshipChain.length - 1) {`

- **src/sql-generator.js** (40 references)
  - [Line 52](../../src/sql-generator.js#L52): `if (!aggregateGroups.has(relationshipKey)) {`
  - [Line 67](../../src/sql-generator.js#L67): `if (context === 'main') {`
  - [Line 69](../../src/sql-generator.js#L69): `if (joinIntent.relationshipType === 'direct_relationship') {`
  - [Line 70](../../src/sql-generator.js#L70): `if (joinIntent.relationshipChain && joinIntent.relationshipChain.length > 1) {`
  - [Line 101](../../src/sql-generator.js#L101): `if (aggIntent.aggregateFunction.startsWith(FUNCTIONS.STRING_AGG)) {`
  - [Line 103](../../src/sql-generator.js#L103): `} else if (aggIntent.aggregateFunction === FUNCTIONS.COUNT_AGG) {`
  - [Line 105](../../src/sql-generator.js#L105): `} else if (aggIntent.aggregateFunction === FUNCTIONS.SUM_AGG) {`
  - [Line 107](../../src/sql-generator.js#L107): `} else if (aggIntent.aggregateFunction === FUNCTIONS.AVG_AGG) {`
  - [Line 109](../../src/sql-generator.js#L109): `} else if (aggIntent.aggregateFunction === FUNCTIONS.MIN_AGG) {`
  - [Line 111](../../src/sql-generator.js#L111): `} else if (aggIntent.aggregateFunction === FUNCTIONS.MAX_AGG) {`
  - [Line 113](../../src/sql-generator.js#L113): `} else if (aggIntent.aggregateFunction === FUNCTIONS.AND_AGG) {`
  - [Line 115](../../src/sql-generator.js#L115): `} else if (aggIntent.aggregateFunction === FUNCTIONS.OR_AGG) {`
  - [Line 142](../../src/sql-generator.js#L142): `if (joinIntent.compilationContext === 'main') {`
  - [Line 144](../../src/sql-generator.js#L144): `if (joinIntent.relationshipType === 'direct_relationship') {`
  - [Line 145](../../src/sql-generator.js#L145): `if (joinIntent.relationshipChain && joinIntent.relationshipChain.length > 1) {`
  - [Line 148](../../src/sql-generator.js#L148): `if (chainIndex === 0) {`
  - [Line 163](../../src/sql-generator.js#L163): `if (parentJoinSemanticId) {`
  - [Line 165](../../src/sql-generator.js#L165): `if (parentAlias) {`
  - [Line 224](../../src/sql-generator.js#L224): `if (aggIntents.length === 0) {`
  - [Line 231](../../src/sql-generator.js#L231): `if (!chainInfo || chainInfo.length === 0) {`
  - [Line 264](../../src/sql-generator.js#L264): `if (alias && joinIntent.relationshipType === 'direct_relationship') {`
  - [Line 278](../../src/sql-generator.js#L278): `if (!columnMapping) {`
  - [Line 343](../../src/sql-generator.js#L343): `if (aggIntents.length === 0) {`
  - [Line 351](../../src/sql-generator.js#L351): `if (firstIntent.isMultiLevel && firstIntent.chainInfo) {`
  - [Line 371](../../src/sql-generator.js#L371): `if (alias && joinIntent.relationshipType === 'direct_relationship') {`
  - [Line 385](../../src/sql-generator.js#L385): `if (!columnMapping) {`
  - [Line 457](../../src/sql-generator.js#L457): `if (alias && joinIntent.relationshipType === 'direct_relationship') {`
  - [Line 517](../../src/sql-generator.js#L517): `if (!expr) {`
  - [Line 520](../../src/sql-generator.js#L520): `if (!expr.type) {`
  - [Line 548](../../src/sql-generator.js#L548): `if (!finalJoinAlias) {`
  - [Line 563](../../src/sql-generator.js#L563): `if (expr.value.op === TokenValue.AMPERSAND) {`
  - [Line 565](../../src/sql-generator.js#L565): `} else if (expr.value.op === TokenValue.EQ) {`
  - [Line 567](../../src/sql-generator.js#L567): `} else if (expr.value.op === TokenValue.NEQ_BANG || expr.value.op === TokenValue.NEQ_BRACKETS) {`
  - [Line 569](../../src/sql-generator.js#L569): `} else if (expr.value.op === TokenValue.PLUS) {`
  - [Line 571](../../src/sql-generator.js#L571): `if (leftType === TYPE.DATE && rightType === TYPE.NUMBER) {`
  - [Line 573](../../src/sql-generator.js#L573): `} else if (leftType === TYPE.NUMBER && rightType === TYPE.DATE) {`
  - [Line 578](../../src/sql-generator.js#L578): `} else if (expr.value.op === TokenValue.MINUS) {`
  - [Line 580](../../src/sql-generator.js#L580): `if (leftType === TYPE.DATE && rightType === TYPE.NUMBER) {`
  - [Line 595](../../src/sql-generator.js#L595): `if (!aggMapping) {`
  - [Line 686](../../src/sql-generator.js#L686): `if (expr.children.length === 3) {`

- **src/types-unified.js** (9 references)
  - [Line 213](../../src/types-unified.js#L213): `'Conditional functions: `IF()` conditions',`
  - [Line 256](../../src/types-unified.js#L256): `'- Conditional expressions in `IF(condition, trueValue, falseValue)`',`
  - [Line 346](../../src/types-unified.js#L346): `if (!valueType) {`
  - [Line 360](../../src/types-unified.js#L360): `if (!description) {`
  - [Line 376](../../src/types-unified.js#L376): `if (!expectedTypes.includes(type)) {`
  - [Line 392](../../src/types-unified.js#L392): `if (type1 === TYPE.NULL || type2 === TYPE.NULL) {`
  - [Line 397](../../src/types-unified.js#L397): `if (operation === 'comparison' || operation === 'logical') {`
  - [Line 402](../../src/types-unified.js#L402): `if (operation === 'arithmetic') {`
  - [Line 408](../../src/types-unified.js#L408): `if (operation === 'concatenation') {`

- **src/utils.js** (3 references)
  - [Line 6](../../src/utils.js#L6): `if (['numeric', 'integer', 'bigint', 'smallint', 'decimal', 'real', 'double precision'].includes(pgType)) {`
  - [Line 11](../../src/utils.js#L11): `if (['timestamp', 'timestamp with time zone', 'timestamptz', 'date'].includes(pgType)) {`
  - [Line 16](../../src/utils.js#L16): `if (pgType === 'boolean') {`
</details>

---

## EVAL

**Signature:** `EVAL(relationshipRef)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Evaluates an expression from another table

**Arguments:**
- `relationshipRef` ([inverse relationship](../types.md#inverse-relationship)): Reference to relationship and expression


<details>
<summary><strong>Test References</strong> (0 found)</summary>

No test references found for this function.
</details>

<details>
<summary><strong>Usage Examples</strong> (0 found)</summary>

No usage examples found for this function.
</details>


*Documentation generated on 2025-06-22T21:40:57.157Z*
