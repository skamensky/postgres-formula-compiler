# Formula Compiler Metadata-Driven Refactoring Requirements

## Overview

This document outlines the requirements for implementing Language Specification and Documentation (see @TODO) and refactoring the formula compiler to use metadata as a single source of truth.

## Initial Requirements

### Database Setup
**User Comment**: 
> "You should first run: `echo 'DATABASE_URL=postgresql://postgres.rmmhdtomicimwbxcthih:BHdrf4knYacBQGzX@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' > .env` So that you can later run the exec tests"

- Set up database environment variable for PostgreSQL connection
- Ensure exec tests can run against the database after implementation

### Primary Objective: Language Specification and Documentation

From TODO.md , implement a comprehensive documentation system for the formula language including:

1. **Auto-generated Documentation**: Create documentation that stays current with compiler changes
2. **Function Reference**: Complete documentation of all 43+ functions
3. **Operator Reference**: Document all operators with precedence and associativity
4. **Data Types Reference**: Document type system and conversions
5. **Syntax Reference**: Language syntax and grammar documentation
6. **Error Reference**: Comprehensive error message documentation

## Critical User Feedback and Requirements

### Metadata as Single Source of Truth
You must refactor the compiler so that it uses the compilter metadata to function. This way we have a single source of truth and if we change something in the metadata it gets updated in both the compilter and the docs.

This means argument count, function name, types, etc should be metadata driven within the compiler as well. 

**Key Requirements**:
- Refactor compiler to be **metadata-driven**
- Ensure metadata serves as the **single source of truth**
- When metadata changes, **both compiler AND documentation** should automatically update
- Eliminate duplication between compiler logic and documentation

### Documentation System Requirements


1. **Auto-Generation**: Build system to generate documentation from metadata:
   - Function reference pages
   - Operator reference
   - Data type documentation
   - Syntax guides
   - Error message reference

2. **Validation**: Ensure metadata-driven validation in compiler:
   - Argument count checking
   - Type validation
   - Error message generation using metadata

## Implementation Scope

### Compiler Refactoring
- Replace hardcoded function validation with metadata-driven approach
- Ensure all function compilation uses centralized metadata
- Fix any tests that break as a result of our refactor
- Improve error messages to use actual parameter names from metadata

### Documentation Generation
- Create automated documentation generation script
- Generate markdown files for all language components
- Ensure documentation reflects actual compiler behavior
- Include test references and usage examples
- Have two folders:
    - usage - geared towards people who just want a language reference to build formulas
    - lang - geared towards contributors or people interested in how the language works

### Integration
- Add npm script for documentation generation
- Ensure documentation stays synchronized with compiler changes
- Validate that database exec tests continue to work

## Success Criteria

1. **Single Source of Truth**: Metadata changes automatically update both compiler and documentation
2. **Backward Compatibility**: All existing tests continue to pass
3. **Documentation Quality**: Auto-generated docs are comprehensive and current
4. **Developer Experience**: Adding new functions requires only metadata changes
5. **Error Messages**: Improved error messages using parameter names from metadata
