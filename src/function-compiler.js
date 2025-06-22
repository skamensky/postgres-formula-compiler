import { Compiler } from './compiler.js';

/**
 * Extend the Compiler class with function compilation methods
 */

Compiler.prototype.compileFunction = function(node) {
  const funcName = node.name;
  
  // Handle aggregate functions separately
  if (['STRING_AGG', 'STRING_AGG_DISTINCT', 'SUM_AGG', 'COUNT_AGG', 'AVG_AGG', 'MIN_AGG', 'MAX_AGG', 'AND_AGG', 'OR_AGG'].includes(funcName)) {
    return this.compileAggregateFunction(node);
  }
  
  // Handle regular functions
  switch (funcName) {
    case 'TODAY':
      if (node.args.length !== 0) {
        this.error('TODAY() takes no arguments', node.position);
      }
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'TODAY'),
        dependentJoins: [],
        returnType: 'date',
        compilationContext: this.compilationContext,
        value: { name: 'TODAY', args: [] }
      };

    case 'ME':
      if (node.args.length !== 0) {
        this.error('ME() takes no arguments', node.position);
      }
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ME'),
        dependentJoins: [],
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'ME', args: [] }
      };

    case 'DATE':
      if (node.args.length !== 1) {
        this.error('DATE() takes exactly one argument', node.position);
      }
      
      const dateArg = this.compile(node.args[0]);
      if (dateArg.type !== 'STRING_LITERAL') {
        this.error('DATE() function requires a string literal', node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'DATE', [dateArg.semanticId]),
        dependentJoins: [],
        returnType: 'date',
        compilationContext: this.compilationContext,
        value: { name: 'DATE', stringValue: dateArg.value },
        children: [dateArg]
      };

    case 'STRING':
      if (node.args.length !== 1) {
        this.error('STRING() takes exactly one argument', node.position);
      }
      
      const stringArg = this.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'STRING', [stringArg.semanticId]),
        dependentJoins: stringArg.dependentJoins,
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'STRING' },
        children: [stringArg]
      };

    case 'IF':
      return this.compileIfFunction(node);

    case 'UPPER':
    case 'LOWER':
    case 'TRIM':
      return this.compileStringFunction(node, funcName);

    case 'LEN':
      if (node.args.length !== 1) {
        this.error('LEN() takes exactly one argument', node.position);
      }
      
      const lenArg = this.compile(node.args[0]);
      if (lenArg.returnType !== 'string') {
        this.error('LEN() requires string argument, got ' + lenArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'LEN', [lenArg.semanticId]),
        dependentJoins: lenArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'LEN' },
        children: [lenArg]
      };

    case 'LEFT':
      if (node.args.length !== 2) {
        this.error('LEFT() takes exactly two arguments: LEFT(text, num)', node.position);
      }
      
      const leftArg1 = this.compile(node.args[0]);
      const leftArg2 = this.compile(node.args[1]);
      
      if (leftArg1.returnType !== 'string') {
        this.error('LEFT() first argument must be string, got ' + leftArg1.returnType, node.position);
      }
      if (leftArg2.returnType !== 'number') {
        this.error('LEFT() second argument must be number, got ' + leftArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'LEFT', [leftArg1.semanticId, leftArg2.semanticId]),
        dependentJoins: [...leftArg1.dependentJoins, ...leftArg2.dependentJoins],
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'LEFT' },
        children: [leftArg1, leftArg2]
      };

    case 'RIGHT':
      if (node.args.length !== 2) {
        this.error('RIGHT() takes exactly two arguments: RIGHT(text, num)', node.position);
      }
      
      const rightArg1 = this.compile(node.args[0]);
      const rightArg2 = this.compile(node.args[1]);
      
      if (rightArg1.returnType !== 'string') {
        this.error('RIGHT() first argument must be string, got ' + rightArg1.returnType, node.position);
      }
      if (rightArg2.returnType !== 'number') {
        this.error('RIGHT() second argument must be number, got ' + rightArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'RIGHT', [rightArg1.semanticId, rightArg2.semanticId]),
        dependentJoins: [...rightArg1.dependentJoins, ...rightArg2.dependentJoins],
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'RIGHT' },
        children: [rightArg1, rightArg2]
      };

    case 'MID':
      if (node.args.length !== 3) {
        this.error('MID() takes exactly three arguments: MID(text, start, length)', node.position);
      }
      
      const midArg1 = this.compile(node.args[0]);
      const midArg2 = this.compile(node.args[1]);
      const midArg3 = this.compile(node.args[2]);
      
      if (midArg1.returnType !== 'string') {
        this.error('MID() first argument must be string, got ' + midArg1.returnType, node.position);
      }
      if (midArg2.returnType !== 'number') {
        this.error('MID() second argument must be number, got ' + midArg2.returnType, node.position);
      }
      if (midArg3.returnType !== 'number') {
        this.error('MID() third argument must be number, got ' + midArg3.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'MID', [midArg1.semanticId, midArg2.semanticId, midArg3.semanticId]),
        dependentJoins: [...midArg1.dependentJoins, ...midArg2.dependentJoins, ...midArg3.dependentJoins],
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'MID' },
        children: [midArg1, midArg2, midArg3]
      };

    case 'ISNULL':
      if (node.args.length !== 1) {
        this.error('ISNULL() takes exactly one argument', node.position);
      }
      
      const isnullArg = this.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ISNULL', [isnullArg.semanticId]),
        dependentJoins: isnullArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'ISNULL' },
        children: [isnullArg]
      };

    case 'NULLVALUE':
      if (node.args.length !== 2) {
        this.error('NULLVALUE() takes exactly two arguments', node.position);
      }
      
      const nullvalueArg1 = this.compile(node.args[0]);
      const nullvalueArg2 = this.compile(node.args[1]);
      
      // Type checking - both arguments should be the same type (unless one is null)
      if (nullvalueArg1.returnType !== nullvalueArg2.returnType && 
          nullvalueArg1.returnType !== 'null' && nullvalueArg2.returnType !== 'null') {
        this.error(`NULLVALUE() value and default must be the same type, got ${nullvalueArg1.returnType} and ${nullvalueArg2.returnType}`, node.position);
      }
      
      // Return type is the non-null type, or the first type if both are non-null
      const nullvalueReturnType = nullvalueArg1.returnType !== 'null' ? nullvalueArg1.returnType : nullvalueArg2.returnType;
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'NULLVALUE', [nullvalueArg1.semanticId, nullvalueArg2.semanticId]),
        dependentJoins: [...nullvalueArg1.dependentJoins, ...nullvalueArg2.dependentJoins],
        returnType: nullvalueReturnType,
        compilationContext: this.compilationContext,
        value: { name: 'NULLVALUE' },
        children: [nullvalueArg1, nullvalueArg2]
      };

    case 'ISBLANK':
      if (node.args.length !== 1) {
        this.error('ISBLANK() takes exactly one argument', node.position);
      }
      
      const isblankArg = this.compile(node.args[0]);
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ISBLANK', [isblankArg.semanticId]),
        dependentJoins: isblankArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'ISBLANK' },
        children: [isblankArg]
      };

    case 'AND':
      if (node.args.length < 2) {
        this.error('AND() takes at least two arguments', node.position);
      }
      
      const andArgs = [];
      const andDependentJoins = [];
      const andChildIds = [];
      
      for (let i = 0; i < node.args.length; i++) {
        const arg = this.compile(node.args[i]);
        if (arg.returnType !== 'boolean') {
          this.error(`AND() argument ${i + 1} must be boolean, got ${arg.returnType}`, node.position);
        }
        andArgs.push(arg);
        andDependentJoins.push(...arg.dependentJoins);
        andChildIds.push(arg.semanticId);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'AND', andChildIds),
        dependentJoins: andDependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'AND' },
        children: andArgs
      };

    case 'OR':
      if (node.args.length < 2) {
        this.error('OR() takes at least two arguments', node.position);
      }
      
      const orArgs = [];
      const orDependentJoins = [];
      const orChildIds = [];
      
      for (let i = 0; i < node.args.length; i++) {
        const arg = this.compile(node.args[i]);
        if (arg.returnType !== 'boolean') {
          this.error(`OR() argument ${i + 1} must be boolean, got ${arg.returnType}`, node.position);
        }
        orArgs.push(arg);
        orDependentJoins.push(...arg.dependentJoins);
        orChildIds.push(arg.semanticId);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'OR', orChildIds),
        dependentJoins: orDependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'OR' },
        children: orArgs
      };

    case 'NOT':
      if (node.args.length !== 1) {
        this.error('NOT() takes exactly one argument', node.position);
      }
      
      const notArg = this.compile(node.args[0]);
      if (notArg.returnType !== 'boolean') {
        this.error('NOT() requires boolean argument, got ' + notArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'NOT', [notArg.semanticId]),
        dependentJoins: notArg.dependentJoins,
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'NOT' },
        children: [notArg]
      };

    case 'CONTAINS':
      if (node.args.length !== 2) {
        this.error('CONTAINS() takes exactly two arguments: CONTAINS(text, search)', node.position);
      }
      
      const containsArg1 = this.compile(node.args[0]);
      const containsArg2 = this.compile(node.args[1]);
      
      if (containsArg1.returnType !== 'string') {
        this.error('CONTAINS() first argument must be string, got ' + containsArg1.returnType, node.position);
      }
      if (containsArg2.returnType !== 'string') {
        this.error('CONTAINS() second argument must be string, got ' + containsArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'CONTAINS', [containsArg1.semanticId, containsArg2.semanticId]),
        dependentJoins: [...containsArg1.dependentJoins, ...containsArg2.dependentJoins],
        returnType: 'boolean',
        compilationContext: this.compilationContext,
        value: { name: 'CONTAINS' },
        children: [containsArg1, containsArg2]
      };

    case 'SUBSTITUTE':
      if (node.args.length !== 3) {
        this.error('SUBSTITUTE() takes exactly three arguments: SUBSTITUTE(text, old_text, new_text)', node.position);
      }
      
      const subArg1 = this.compile(node.args[0]);
      const subArg2 = this.compile(node.args[1]);
      const subArg3 = this.compile(node.args[2]);
      
      if (subArg1.returnType !== 'string') {
        this.error('SUBSTITUTE() first argument must be string, got ' + subArg1.returnType, node.position);
      }
      if (subArg2.returnType !== 'string') {
        this.error('SUBSTITUTE() second argument must be string, got ' + subArg2.returnType, node.position);
      }
      if (subArg3.returnType !== 'string') {
        this.error('SUBSTITUTE() third argument must be string, got ' + subArg3.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'SUBSTITUTE', [subArg1.semanticId, subArg2.semanticId, subArg3.semanticId]),
        dependentJoins: [...subArg1.dependentJoins, ...subArg2.dependentJoins, ...subArg3.dependentJoins],
        returnType: 'string',
        compilationContext: this.compilationContext,
        value: { name: 'SUBSTITUTE' },
        children: [subArg1, subArg2, subArg3]
      };

    // Math functions
    case 'ABS':
      if (node.args.length !== 1) {
        this.error('ABS() takes exactly one argument', node.position);
      }
      
      const absArg = this.compile(node.args[0]);
      if (absArg.returnType !== 'number') {
        this.error('ABS() requires number argument, got ' + absArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ABS', [absArg.semanticId]),
        dependentJoins: absArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'ABS' },
        children: [absArg]
      };

    case 'ROUND':
      if (node.args.length !== 2) {
        this.error('ROUND() takes exactly two arguments: ROUND(number, decimals)', node.position);
      }
      
      const roundArg1 = this.compile(node.args[0]);
      const roundArg2 = this.compile(node.args[1]);
      
      if (roundArg1.returnType !== 'number') {
        this.error('ROUND() first argument must be number, got ' + roundArg1.returnType, node.position);
      }
      if (roundArg2.returnType !== 'number') {
        this.error('ROUND() second argument must be number, got ' + roundArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ROUND', [roundArg1.semanticId, roundArg2.semanticId]),
        dependentJoins: [...roundArg1.dependentJoins, ...roundArg2.dependentJoins],
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'ROUND' },
        children: [roundArg1, roundArg2]
      };

    case 'MIN':
      if (node.args.length !== 2) {
        this.error('MIN() takes exactly two arguments: MIN(num1, num2)', node.position);
      }
      
      const minArg1 = this.compile(node.args[0]);
      const minArg2 = this.compile(node.args[1]);
      
      if (minArg1.returnType !== 'number') {
        this.error('MIN() first argument must be number, got ' + minArg1.returnType, node.position);
      }
      if (minArg2.returnType !== 'number') {
        this.error('MIN() second argument must be number, got ' + minArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'MIN', [minArg1.semanticId, minArg2.semanticId]),
        dependentJoins: [...minArg1.dependentJoins, ...minArg2.dependentJoins],
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'MIN' },
        children: [minArg1, minArg2]
      };

    case 'MAX':
      if (node.args.length !== 2) {
        this.error('MAX() takes exactly two arguments: MAX(num1, num2)', node.position);
      }
      
      const maxArg1 = this.compile(node.args[0]);
      const maxArg2 = this.compile(node.args[1]);
      
      if (maxArg1.returnType !== 'number') {
        this.error('MAX() first argument must be number, got ' + maxArg1.returnType, node.position);
      }
      if (maxArg2.returnType !== 'number') {
        this.error('MAX() second argument must be number, got ' + maxArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'MAX', [maxArg1.semanticId, maxArg2.semanticId]),
        dependentJoins: [...maxArg1.dependentJoins, ...maxArg2.dependentJoins],
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'MAX' },
        children: [maxArg1, maxArg2]
      };

    case 'MOD':
      if (node.args.length !== 2) {
        this.error('MOD() takes exactly two arguments: MOD(dividend, divisor)', node.position);
      }
      
      const modArg1 = this.compile(node.args[0]);
      const modArg2 = this.compile(node.args[1]);
      
      if (modArg1.returnType !== 'number') {
        this.error('MOD() first argument must be number, got ' + modArg1.returnType, node.position);
      }
      if (modArg2.returnType !== 'number') {
        this.error('MOD() second argument must be number, got ' + modArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'MOD', [modArg1.semanticId, modArg2.semanticId]),
        dependentJoins: [...modArg1.dependentJoins, ...modArg2.dependentJoins],
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'MOD' },
        children: [modArg1, modArg2]
      };

    case 'CEILING':
      if (node.args.length !== 1) {
        this.error('CEILING() takes exactly one argument', node.position);
      }
      
      const ceilingArg = this.compile(node.args[0]);
      if (ceilingArg.returnType !== 'number') {
        this.error('CEILING() requires number argument, got ' + ceilingArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'CEILING', [ceilingArg.semanticId]),
        dependentJoins: ceilingArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'CEILING' },
        children: [ceilingArg]
      };

    case 'FLOOR':
      if (node.args.length !== 1) {
        this.error('FLOOR() takes exactly one argument', node.position);
      }
      
      const floorArg = this.compile(node.args[0]);
      if (floorArg.returnType !== 'number') {
        this.error('FLOOR() requires number argument, got ' + floorArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'FLOOR', [floorArg.semanticId]),
        dependentJoins: floorArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'FLOOR' },
        children: [floorArg]
      };

    // Date functions
    case 'YEAR':
      if (node.args.length !== 1) {
        this.error('YEAR() takes exactly one argument', node.position);
      }
      
      const yearArg = this.compile(node.args[0]);
      if (yearArg.returnType !== 'date') {
        this.error('YEAR() requires date argument, got ' + yearArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'YEAR', [yearArg.semanticId]),
        dependentJoins: yearArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'YEAR' },
        children: [yearArg]
      };

    case 'MONTH':
      if (node.args.length !== 1) {
        this.error('MONTH() takes exactly one argument', node.position);
      }
      
      const monthArg = this.compile(node.args[0]);
      if (monthArg.returnType !== 'date') {
        this.error('MONTH() requires date argument, got ' + monthArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'MONTH', [monthArg.semanticId]),
        dependentJoins: monthArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'MONTH' },
        children: [monthArg]
      };

    case 'DAY':
      if (node.args.length !== 1) {
        this.error('DAY() takes exactly one argument', node.position);
      }
      
      const dayArg = this.compile(node.args[0]);
      if (dayArg.returnType !== 'date') {
        this.error('DAY() requires date argument, got ' + dayArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'DAY', [dayArg.semanticId]),
        dependentJoins: dayArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'DAY' },
        children: [dayArg]
      };

    case 'WEEKDAY':
      if (node.args.length !== 1) {
        this.error('WEEKDAY() takes exactly one argument', node.position);
      }
      
      const weekdayArg = this.compile(node.args[0]);
      if (weekdayArg.returnType !== 'date') {
        this.error('WEEKDAY() requires date argument, got ' + weekdayArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'WEEKDAY', [weekdayArg.semanticId]),
        dependentJoins: weekdayArg.dependentJoins,
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'WEEKDAY' },
        children: [weekdayArg]
      };

    case 'ADDMONTHS':
      if (node.args.length !== 2) {
        this.error('ADDMONTHS() takes exactly two arguments: ADDMONTHS(date, months)', node.position);
      }
      
      const addMonthsArg1 = this.compile(node.args[0]);
      const addMonthsArg2 = this.compile(node.args[1]);
      
      if (addMonthsArg1.returnType !== 'date') {
        this.error('ADDMONTHS() first argument must be date, got ' + addMonthsArg1.returnType, node.position);
      }
      if (addMonthsArg2.returnType !== 'number') {
        this.error('ADDMONTHS() second argument must be number, got ' + addMonthsArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ADDMONTHS', [addMonthsArg1.semanticId, addMonthsArg2.semanticId]),
        dependentJoins: [...addMonthsArg1.dependentJoins, ...addMonthsArg2.dependentJoins],
        returnType: 'date',
        compilationContext: this.compilationContext,
        value: { name: 'ADDMONTHS' },
        children: [addMonthsArg1, addMonthsArg2]
      };

    case 'ADDDAYS':
      if (node.args.length !== 2) {
        this.error('ADDDAYS() takes exactly two arguments: ADDDAYS(date, days)', node.position);
      }
      
      const addDaysArg1 = this.compile(node.args[0]);
      const addDaysArg2 = this.compile(node.args[1]);
      
      if (addDaysArg1.returnType !== 'date') {
        this.error('ADDDAYS() first argument must be date, got ' + addDaysArg1.returnType, node.position);
      }
      if (addDaysArg2.returnType !== 'number') {
        this.error('ADDDAYS() second argument must be number, got ' + addDaysArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'ADDDAYS', [addDaysArg1.semanticId, addDaysArg2.semanticId]),
        dependentJoins: [...addDaysArg1.dependentJoins, ...addDaysArg2.dependentJoins],
        returnType: 'date',
        compilationContext: this.compilationContext,
        value: { name: 'ADDDAYS' },
        children: [addDaysArg1, addDaysArg2]
      };

    case 'DATEDIF':
      if (node.args.length !== 3) {
        this.error('DATEDIF() takes exactly three arguments: DATEDIF(date1, date2, unit)', node.position);
      }
      
      const datedifArg1 = this.compile(node.args[0]);
      const datedifArg2 = this.compile(node.args[1]);
      
      if (datedifArg1.returnType !== 'date') {
        this.error('DATEDIF() first argument must be date, got ' + datedifArg1.returnType, node.position);
      }
      if (datedifArg2.returnType !== 'date') {
        this.error('DATEDIF() second argument must be date, got ' + datedifArg2.returnType, node.position);
      }
      
      // Third argument must be a string literal
      if (node.args[2].type !== 'STRING_LITERAL') {
        this.error('DATEDIF() third argument must be a string literal: "days", "months", or "years"', node.position);
      }
      
      const unit = node.args[2].value;
      if (!['days', 'months', 'years'].includes(unit)) {
        this.error(`DATEDIF() unit must be "days", "months", or "years", got "${unit}"`, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: this.generateSemanticId('function', 'DATEDIF', [datedifArg1.semanticId, datedifArg2.semanticId, unit]),
        dependentJoins: [...datedifArg1.dependentJoins, ...datedifArg2.dependentJoins],
        returnType: 'number',
        compilationContext: this.compilationContext,
        value: { name: 'DATEDIF', unit: unit },
        children: [datedifArg1, datedifArg2]
      };

    // Add other function cases...
    default:
      this.error(`Unknown function: ${funcName}`, node.position);
  }
};

Compiler.prototype.compileIfFunction = function(node) {
  if (node.args.length < 2 || node.args.length > 3) {
    this.error('IF() takes 2 or 3 arguments: IF(condition, true_value, false_value) or IF(condition, true_value)', node.position);
  }
  
  const condition = this.compile(node.args[0]);
  const trueValue = this.compile(node.args[1]);
  let falseValue = null;
  
  if (node.args.length === 3) {
    falseValue = this.compile(node.args[2]);
    
    if (trueValue.returnType !== falseValue.returnType) {
      this.error(`IF() true and false values must be the same type, got ${trueValue.returnType} and ${falseValue.returnType}`, node.position);
    }
  }
  
  if (condition.returnType !== 'boolean') {
    this.error(`IF() condition must be boolean, got ${condition.returnType}`, node.position);
  }
  
  const children = falseValue ? [condition, trueValue, falseValue] : [condition, trueValue];
  const childIds = children.map(child => child.semanticId);
  const dependentJoins = children.flatMap(child => child.dependentJoins);
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: this.generateSemanticId('function', 'IF', childIds),
    dependentJoins: dependentJoins,
    returnType: trueValue.returnType,
    compilationContext: this.compilationContext,
    value: { name: 'IF' },
    children: children
  };
};

Compiler.prototype.compileStringFunction = function(node, funcName) {
  if (node.args.length !== 1) {
    this.error(`${funcName}() takes exactly one argument`, node.position);
  }
  
  const arg = this.compile(node.args[0]);
  if (arg.returnType !== 'string') {
    this.error(`${funcName}() requires string argument, got ${arg.returnType}`, node.position);
  }
  
  return {
    type: 'FUNCTION_CALL',
    semanticId: this.generateSemanticId('function', funcName, [arg.semanticId]),
    dependentJoins: arg.dependentJoins,
    returnType: 'string',
    compilationContext: this.compilationContext,
    value: { name: funcName },
    children: [arg]
  };
};

Compiler.prototype.compileAggregateFunction = function(node) {
  const funcName = node.name;
  let expectedArgCount = 2; // Most aggregate functions take 2 args
  if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
    expectedArgCount = 3; // STRING_AGG takes delimiter as 3rd arg
  }
  
  if (node.args.length !== expectedArgCount) {
    this.error(`${funcName}() takes exactly ${expectedArgCount} arguments`, node.position);
  }

  // First argument must be an inverse relationship identifier
  const relationshipArg = node.args[0];
  if (relationshipArg.type !== 'IDENTIFIER') {
    this.error(`${funcName}() first argument must be an inverse relationship name`, node.position);
  }

  const relationshipName = relationshipArg.value.toLowerCase();
  
  // Check if inverse relationship info exists
  const inverseRelKeys = Object.keys(this.context.inverseRelationshipInfo || {});
  const matchingKey = inverseRelKeys.find(key => key.toLowerCase() === relationshipName);
  
  if (!matchingKey) {
    const availableRelationships = inverseRelKeys.slice(0, 10);
    const suggestionText = availableRelationships.length > 0 
      ? ` Available inverse relationships: ${availableRelationships.join(', ')}${inverseRelKeys.length > 10 ? ' (and ' + (inverseRelKeys.length - 10) + ' more)' : ''}`
      : '';
    this.error(`Unknown inverse relationship: ${relationshipArg.value}.${suggestionText}`, node.position);
  }

  const inverseRelInfo = this.context.inverseRelationshipInfo[matchingKey];
  
  // Create sub-compilation context for aggregate expression
  // Build tableInfos and relationshipInfos for the sub-context from the nested structure
  const subTableInfos = [
    {
      tableName: inverseRelInfo.tableName,
      columnList: inverseRelInfo.columnList
    }
  ];
  
  const subRelationshipInfos = [];
  if (inverseRelInfo.relationshipInfo) {
    for (const [relName, relInfo] of Object.entries(inverseRelInfo.relationshipInfo)) {
      subRelationshipInfos.push({
        name: relName,
        fromTable: inverseRelInfo.tableName,
        toTable: relInfo.tableName || relName,
        joinColumn: relInfo.joinColumn
      });
      
      // Add target table info if not already present
      if (!subTableInfos.find(t => t.tableName === (relInfo.tableName || relName))) {
        subTableInfos.push({
          tableName: relInfo.tableName || relName,
          columnList: relInfo.columnList || {}
        });
      }
    }
  }
  
  const subContext = {
    tableName: inverseRelInfo.tableName,
    tableInfos: subTableInfos,
    relationshipInfos: subRelationshipInfos
  };
  
  const subCompiler = new this.constructor(subContext, { maxRelationshipDepth: this.maxRelationshipDepth });
  subCompiler.compilationContext = `agg:${this.tableName}→${inverseRelInfo.tableName}[${inverseRelInfo.joinColumn}]`;
  
  // Compile the expression in sub-context
  const expressionResult = subCompiler.compile(node.args[1]);
  
  // Handle delimiter for STRING_AGG functions
  let delimiterResult = null;
  if (funcName === 'STRING_AGG' || funcName === 'STRING_AGG_DISTINCT') {
    delimiterResult = this.compile(node.args[2]); // Compile in main context
    if (delimiterResult.returnType !== 'string') {
      this.error(`${funcName}() delimiter must be string, got ${delimiterResult.returnType}`, node.position);
    }
  }
  
  // Determine return type
  let returnType;
  if (funcName.startsWith('STRING_AGG')) {
    returnType = 'string';
  } else if (['AND_AGG', 'OR_AGG'].includes(funcName)) {
    returnType = 'boolean';
  } else {
    returnType = 'number';
  }
  
  // Generate aggregate intent
  // For COUNT_AGG, use the same semantic ID regardless of column since SQL is always COUNT(*)
  let semanticDetails;
  if (funcName === 'COUNT_AGG') {
    semanticDetails = `${funcName}[${subCompiler.compilationContext}]`;
  } else {
    semanticDetails = `${funcName}[${expressionResult.semanticId}]`;
  }
  const aggSemanticId = this.generateSemanticId('aggregate', semanticDetails);
  
  const aggregateIntent = {
    semanticId: aggSemanticId,
    aggregateFunction: funcName,
    sourceRelation: matchingKey,
    expression: expressionResult,
    delimiter: delimiterResult,
    internalJoins: Array.from(subCompiler.joinIntents.values()),
    returnType: returnType
  };
  
  // Track aggregate intent
  this.aggregateIntents.set(aggSemanticId, aggregateIntent);
  
  return {
    type: 'AGGREGATE_FUNCTION',
    semanticId: aggSemanticId,
    dependentJoins: [], // Aggregates don't create main query joins
    returnType: returnType,
    compilationContext: this.compilationContext,
    value: { 
      aggregateSemanticId: aggSemanticId,
      aggregateIntent: aggregateIntent
    }
  };
};

// This file extends the Compiler prototype and doesn't need explicit exports