# Aggregate Functions


## STRING_AGG

**Signature:** `STRING_AGG(relationship, expression, delimiter)`  
**Returns:** string  
**Description:** Concatenates values from related records with delimiter

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Expression to evaluate for each record
- `delimiter` (string): String delimiter to separate values

**Test References:** [tests/aggregate-functions.test.js:15](../../tests/aggregate-functions.test.js:15)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## STRING_AGG_DISTINCT

**Signature:** `STRING_AGG_DISTINCT(relationship, expression, delimiter)`  
**Returns:** string  
**Description:** Concatenates distinct values from related records with delimiter

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Expression to evaluate for each record
- `delimiter` (string): String delimiter to separate values

**Test References:** [tests/aggregate-functions.test.js:33](../../tests/aggregate-functions.test.js:33)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## SUM_AGG

**Signature:** `SUM_AGG(relationship, expression)`  
**Returns:** number  
**Description:** Sums numeric values from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Numeric expression to sum

**Test References:** [tests/aggregate-functions.test.js:45](../../tests/aggregate-functions.test.js:45)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## COUNT_AGG

**Signature:** `COUNT_AGG(relationship, expression)`  
**Returns:** number  
**Description:** Counts related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to count
- `expression` (expression): Expression to evaluate (value ignored)

**Test References:** [tests/aggregate-functions.test.js:55](../../tests/aggregate-functions.test.js:55)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## AVG_AGG

**Signature:** `AVG_AGG(relationship, expression)`  
**Returns:** number  
**Description:** Averages numeric values from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Numeric expression to average

**Test References:** [tests/aggregate-functions.test.js:65](../../tests/aggregate-functions.test.js:65)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## MIN_AGG

**Signature:** `MIN_AGG(relationship, expression)`  
**Returns:** number  
**Description:** Finds minimum value from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Expression to find minimum of

**Test References:** [tests/aggregate-functions.test.js:75](../../tests/aggregate-functions.test.js:75)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## MAX_AGG

**Signature:** `MAX_AGG(relationship, expression)`  
**Returns:** number  
**Description:** Finds maximum value from related records

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Expression to find maximum of

**Test References:** [tests/aggregate-functions.test.js:85](../../tests/aggregate-functions.test.js:85)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## AND_AGG

**Signature:** `AND_AGG(relationship, expression)`  
**Returns:** boolean  
**Description:** Returns true if all values from related records are true

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Boolean expression to evaluate

**Test References:** [tests/aggregate-functions.test.js:95](../../tests/aggregate-functions.test.js:95)

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## OR_AGG

**Signature:** `OR_AGG(relationship, expression)`  
**Returns:** boolean  
**Description:** Returns true if any value from related records is true

**Arguments:**
- `relationship` (inverse_relationship): Inverse relationship to aggregate
- `expression` (expression): Boolean expression to evaluate

**Test References:** [tests/aggregate-functions.test.js:105](../../tests/aggregate-functions.test.js:105)

**Example Usage:**
```
// TODO: Add usage examples from test files
```


*Documentation generated on 2025-06-22T17:41:34.479Z*
