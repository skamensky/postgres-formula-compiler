# Formula Compiler Metadata-Driven Refactoring Requirements

## Overview

This document outlines the requirements for implementing Language Specification and Documentation (TODO item #7) and refactoring the formula compiler to use metadata as a single source of truth.

## Initial Requirements

### Database Setup
**User Comment**: 
> "You should first run: `echo 'DATABASE_URL=postgresql://postgres.rmmhdtomicimwbxcthih:BHdrf4knYacBQGzX@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' > .env` So that you can later run the exec tests"

- Set up database environment variable for PostgreSQL connection
- Ensure exec tests can run against the database after implementation

### Primary Objective: Language Specification and Documentation

From TODO.md #7, implement a comprehensive documentation system for the formula language including:

1. **Auto-generated Documentation**: Create documentation that stays current with compiler changes
2. **Function Reference**: Complete documentation of all 43+ functions
3. **Operator Reference**: Document all operators with precedence and associativity
4. **Data Types Reference**: Document type system and conversions
5. **Syntax Reference**: Language syntax and grammar documentation
6. **Error Reference**: Comprehensive error message documentation

## Critical User Feedback and Requirements

### Metadata as Single Source of Truth

**User Comment**: 
> "This metadata in @formula-compiler.js is great! Can you refactor the compiler so that it uses the compilter metadata to function? This way we have a single source of truth and if we change something in the metadata it gets updated in both the compilter and the docs"

**Key Requirements**:
- Refactor compiler to be **metadata-driven**
- Ensure metadata serves as the **single source of truth**
- When metadata changes, **both compiler AND documentation** should automatically update
- Eliminate duplication between compiler logic and documentation

### Documentation System Requirements

1. **Metadata Structure**: Create comprehensive metadata for:
   - `FUNCTION_METADATA`: Function signatures, arguments, return types, descriptions
   - `OPERATOR_METADATA`: Operator precedence, associativity, descriptions
   - `AST_NODE_METADATA`: AST node structure documentation
   - `TOKEN_METADATA`: Token patterns and TextMate scopes

2. **Auto-Generation**: Build system to generate documentation from metadata:
   - Function reference pages
   - Operator reference
   - Data type documentation
   - Syntax guides
   - Error message reference

3. **Validation**: Ensure metadata-driven validation in compiler:
   - Argument count checking
   - Type validation
   - Error message generation using metadata

## Implementation Scope

### Compiler Refactoring
- Replace hardcoded function validation with metadata-driven approach
- Ensure all function compilation uses centralized metadata
- Maintain 100% backward compatibility (all existing tests must pass)
- Improve error messages to use actual parameter names from metadata

### Documentation Generation
- Create automated documentation generation script
- Generate markdown files for all language components
- Ensure documentation reflects actual compiler behavior
- Include test references and usage examples

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

## User Priority Statement

**User Comment**: 
> "The most impeortant thing is to not lose the comments I gave you trhougbout our chat. your implementation details are not improtnat"

**Focus Areas**:
- Preserve all user feedback and requirements
- Prioritize metadata-driven architecture over implementation specifics
- Ensure single source of truth principle is maintained
- Keep database integration working for exec tests

## Branch Conflict Context

**User Comment**: 
> "We have some conflicts with another bramch"

This document serves as the definitive requirements specification to resolve conflicts and ensure consistent implementation across branches.

## Additional Context

### Task Origin
**User Comment**: 
> "Read @TODO.md and implement ## 7. Language Specification and Documentation"

The work stems from TODO item #7 which requires implementing comprehensive language specification and documentation.

### Database Configuration Requirement
The initial setup requires configuring the database connection to enable exec tests, which validates the compiler against real database queries.

### Metadata-Driven Philosophy
The core principle is that metadata should drive both:
1. Compiler function validation and behavior
2. Documentation generation

This ensures perfect synchronization and eliminates the risk of compiler/documentation inconsistencies.

### Quality Assurance
All changes must maintain the existing test suite (309 tests) while improving the developer experience through better error messages and automated documentation generation.