# Aggregate Functions


## COUNT

**Signature:** `COUNT(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Counts the number of non-null values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to count

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## SUM

**Signature:** `SUM(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Sums numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to sum

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## AVG

**Signature:** `AVG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Calculates the average of numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to average

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## MIN_AGG

**Signature:** `MIN_AGG(relationship, value)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Finds the minimum value

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to find minimum of

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## MAX_AGG

**Signature:** `MAX_AGG(relationship, value)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Finds the maximum value

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to find maximum of

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## STRING_AGG

**Signature:** `STRING_AGG(relationship, value, separator)`  
**Returns:** [string](../types.md#string)  
**Description:** Concatenates string values with a separator

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([string](../types.md#string)): String expression to concatenate
- `separator` ([string](../types.md#string)): Separator between values

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## STRING_AGG_DISTINCT

**Signature:** `STRING_AGG_DISTINCT(relationship, value, separator)`  
**Returns:** [string](../types.md#string)  
**Description:** Concatenates unique string values with a separator

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([string](../types.md#string)): String expression to concatenate
- `separator` ([string](../types.md#string)): Separator between values

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## SUM_AGG

**Signature:** `SUM_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Sums numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to sum

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## COUNT_AGG

**Signature:** `COUNT_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Counts the number of non-null values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([expression](../types.md#expression)): Expression to count

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## AVG_AGG

**Signature:** `AVG_AGG(relationship, value)`  
**Returns:** [number](../types.md#number)  
**Description:** Calculates the average of numeric values

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([number](../types.md#number)): Numeric expression to average

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## AND_AGG

**Signature:** `AND_AGG(relationship, value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if all boolean values are true

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([boolean](../types.md#boolean)): Boolean expression to check

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## OR_AGG

**Signature:** `OR_AGG(relationship, value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if any boolean value is true

**Arguments:**
- `relationship` ([inverse relationship](../types.md#inverse-relationship)): Inverse relationship to aggregate
- `value` ([boolean](../types.md#boolean)): Boolean expression to check

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```


*Documentation generated on 2025-06-22T21:16:11.264Z*
