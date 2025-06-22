/**
 * Date Functions
 * Handles YEAR, MONTH, DAY, WEEKDAY, ADDMONTHS, ADDDAYS, DATEDIF functions
 */

/**
 * Compile date function calls
 * @param {Object} compiler - Compiler instance
 * @param {Object} node - Function call AST node
 * @returns {Object} Compiled function call or null if not handled
 */
export function compileDateFunction(compiler, node) {
  const funcName = node.name;
  
  switch (funcName) {
    case 'YEAR':
      if (node.args.length !== 1) {
        compiler.error('YEAR() takes exactly one argument', node.position);
      }
      
      const yearArg = compiler.compile(node.args[0]);
      if (yearArg.returnType !== 'date') {
        compiler.error('YEAR() requires date argument, got ' + yearArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'YEAR', [yearArg.semanticId]),
        dependentJoins: yearArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'YEAR' },
        children: [yearArg]
      };

    case 'MONTH':
      if (node.args.length !== 1) {
        compiler.error('MONTH() takes exactly one argument', node.position);
      }
      
      const monthArg = compiler.compile(node.args[0]);
      if (monthArg.returnType !== 'date') {
        compiler.error('MONTH() requires date argument, got ' + monthArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'MONTH', [monthArg.semanticId]),
        dependentJoins: monthArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'MONTH' },
        children: [monthArg]
      };

    case 'DAY':
      if (node.args.length !== 1) {
        compiler.error('DAY() takes exactly one argument', node.position);
      }
      
      const dayArg = compiler.compile(node.args[0]);
      if (dayArg.returnType !== 'date') {
        compiler.error('DAY() requires date argument, got ' + dayArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'DAY', [dayArg.semanticId]),
        dependentJoins: dayArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'DAY' },
        children: [dayArg]
      };

    case 'WEEKDAY':
      if (node.args.length !== 1) {
        compiler.error('WEEKDAY() takes exactly one argument', node.position);
      }
      
      const weekdayArg = compiler.compile(node.args[0]);
      if (weekdayArg.returnType !== 'date') {
        compiler.error('WEEKDAY() requires date argument, got ' + weekdayArg.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'WEEKDAY', [weekdayArg.semanticId]),
        dependentJoins: weekdayArg.dependentJoins,
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'WEEKDAY' },
        children: [weekdayArg]
      };

    case 'ADDMONTHS':
      if (node.args.length !== 2) {
        compiler.error('ADDMONTHS() takes exactly two arguments: ADDMONTHS(date, months)', node.position);
      }
      
      const addMonthsArg1 = compiler.compile(node.args[0]);
      const addMonthsArg2 = compiler.compile(node.args[1]);
      
      if (addMonthsArg1.returnType !== 'date') {
        compiler.error('ADDMONTHS() first argument must be date, got ' + addMonthsArg1.returnType, node.position);
      }
      if (addMonthsArg2.returnType !== 'number') {
        compiler.error('ADDMONTHS() second argument must be number, got ' + addMonthsArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ADDMONTHS', [addMonthsArg1.semanticId, addMonthsArg2.semanticId]),
        dependentJoins: [...addMonthsArg1.dependentJoins, ...addMonthsArg2.dependentJoins],
        returnType: 'date',
        compilationContext: compiler.compilationContext,
        value: { name: 'ADDMONTHS' },
        children: [addMonthsArg1, addMonthsArg2]
      };

    case 'ADDDAYS':
      if (node.args.length !== 2) {
        compiler.error('ADDDAYS() takes exactly two arguments: ADDDAYS(date, days)', node.position);
      }
      
      const addDaysArg1 = compiler.compile(node.args[0]);
      const addDaysArg2 = compiler.compile(node.args[1]);
      
      if (addDaysArg1.returnType !== 'date') {
        compiler.error('ADDDAYS() first argument must be date, got ' + addDaysArg1.returnType, node.position);
      }
      if (addDaysArg2.returnType !== 'number') {
        compiler.error('ADDDAYS() second argument must be number, got ' + addDaysArg2.returnType, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'ADDDAYS', [addDaysArg1.semanticId, addDaysArg2.semanticId]),
        dependentJoins: [...addDaysArg1.dependentJoins, ...addDaysArg2.dependentJoins],
        returnType: 'date',
        compilationContext: compiler.compilationContext,
        value: { name: 'ADDDAYS' },
        children: [addDaysArg1, addDaysArg2]
      };

    case 'DATEDIF':
      if (node.args.length !== 3) {
        compiler.error('DATEDIF() takes exactly three arguments: DATEDIF(date1, date2, unit)', node.position);
      }
      
      const datedifArg1 = compiler.compile(node.args[0]);
      const datedifArg2 = compiler.compile(node.args[1]);
      
      if (datedifArg1.returnType !== 'date') {
        compiler.error('DATEDIF() first argument must be date, got ' + datedifArg1.returnType, node.position);
      }
      if (datedifArg2.returnType !== 'date') {
        compiler.error('DATEDIF() second argument must be date, got ' + datedifArg2.returnType, node.position);
      }
      
      // Third argument must be a string literal
      if (node.args[2].type !== 'STRING_LITERAL') {
        compiler.error('DATEDIF() third argument must be a string literal: "days", "months", or "years"', node.position);
      }
      
      const unit = node.args[2].value;
      if (!['days', 'months', 'years'].includes(unit)) {
        compiler.error(`DATEDIF() unit must be "days", "months", or "years", got "${unit}"`, node.position);
      }
      
      return {
        type: 'FUNCTION_CALL',
        semanticId: compiler.generateSemanticId('function', 'DATEDIF', [datedifArg1.semanticId, datedifArg2.semanticId, unit]),
        dependentJoins: [...datedifArg1.dependentJoins, ...datedifArg2.dependentJoins],
        returnType: 'number',
        compilationContext: compiler.compilationContext,
        value: { name: 'DATEDIF', unit: unit },
        children: [datedifArg1, datedifArg2]
      };

    default:
      return null; // Not handled by this module
  }
}