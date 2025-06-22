# Null handling Functions


## ISNULL

**Signature:** `ISNULL(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for null

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## ISBLANK

**Signature:** `ISBLANK(value)`  
**Returns:** [boolean](../types.md#boolean)  
**Description:** Returns true if the value is null or empty string

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for blank

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## NULLVALUE

**Signature:** `NULLVALUE(value, defaultValue)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns the first value if not null, otherwise returns the second value

**Arguments:**
- `value` ([expression](../types.md#expression)): Value to check for null
- `defaultValue` ([expression](../types.md#expression)): Value to return if first is null

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```

---

## COALESCE

**Signature:** `COALESCE(values...)`  
**Returns:** [expression](../types.md#expression)  
**Description:** Returns the first non-null value from a list of expressions

**Arguments:**
- `values` ([expression](../types.md#expression)): Values to check (returns first non-null) *(variadic)*

**Test References:** Not specified

**Example Usage:**
```
// TODO: Add usage examples from test files
```


*Documentation generated on 2025-06-22T21:03:23.858Z*
