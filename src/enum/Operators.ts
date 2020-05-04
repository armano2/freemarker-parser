export enum Operators {
  FALSE = 'false',
  TRUE = 'true',
  RAW_STRING = '"',
  RAW_STRING2 = "'",
  DOT = '.',
  DOT_DOT = '..',
  DOT_DOT_LESS = '..<',
  DOT_DOT_NOT = '..!',
  DOT_DOT_ASTERISK = '..*',
  BUILT_IN = '?',
  EXISTS = '??',
  EQUALS = '=',
  DOUBLE_EQUALS = '==',
  NOT_EQUALS = '!=',
  PLUS_EQUALS = '+=',
  MINUS_EQUALS = '-=',
  TIMES_EQUALS = '*=',
  DIV_EQUALS = '/=',
  MOD_EQUALS = '%=',
  PLUS_PLUS = '++',
  MINUS_MINUS = '--',

  ESCAPED_LT = 'lt',
  ESCAPED_LTE = 'lte',
  NATURAL_LT = '<',
  NATURAL_LTE = '<=',

  ESCAPED_GT = 'gt',
  ESCAPED_GTE = 'gte',
  NATURAL_GT = '>',
  NATURAL_GTE = '>=',

  PLUS = '+',
  MINUS = '-',
  TIMES = '*',
  DOUBLE_STAR = '**',
  ELLIPSIS = '...',
  DIVIDE = '/',
  PERCENT = '%',
  AND = '&&',
  OR = '||',
  EXCLAM = '!',
  COMMA = ',',
  SEMICOLON = ';',
  COLON = ':',
  OPEN_BRACKET = '[',
  CLOSE_BRACKET = ']',
  OPEN_PAREN = '(',
  CLOSE_PAREN = ')',
  OPENING_CURLY_BRACKET = '{',
  CLOSING_CURLY_BRACKET = '}',
  IN = 'in',
  AS = 'as',
  USING = 'using',
}

// Store the values to return for the various literals we may encounter
export const Literals: Record<string, boolean> = {
  [Operators.TRUE]: true,
  [Operators.FALSE]: false,
};

// Use a quickly-accessible map to store all of the unary operators
export const UnaryOps: Record<string, boolean> = {
  [Operators.MINUS]: true,
  [Operators.TIMES]: true,
  [Operators.EXCLAM]: true,
  [Operators.PLUS]: true,
  [Operators.MINUS_MINUS]: true,
  [Operators.PLUS_PLUS]: true,
  [Operators.EXISTS]: true,
};

/**
 * @see http://en.wikipedia.org/wiki/Order_of_operations#Programming_language
 */
export const BinaryOps: Record<string, number> = {
  // Assignment operators (right to left)
  [Operators.EQUALS]: 0,
  [Operators.PLUS_EQUALS]: 0,
  [Operators.MINUS_EQUALS]: 0,
  [Operators.TIMES_EQUALS]: 0,
  [Operators.DIV_EQUALS]: 0,
  [Operators.MOD_EQUALS]: 0,
  [Operators.PLUS_PLUS]: 0,
  [Operators.MINUS_MINUS]: 0,
  [Operators.EXISTS]: 0,

  // Logical OR
  [Operators.OR]: 1,

  // Logical AND
  [Operators.AND]: 2,

  // Comparisons: equal and not equal
  [Operators.DOUBLE_EQUALS]: 6,
  [Operators.NOT_EQUALS]: 6,

  // Comparisons: less-than and greater-than
  [Operators.NATURAL_GT]: 7,
  [Operators.NATURAL_LT]: 7,
  [Operators.NATURAL_GTE]: 7,
  [Operators.NATURAL_LTE]: 7,

  [Operators.ESCAPED_GT]: 7,
  [Operators.ESCAPED_LT]: 7,
  [Operators.ESCAPED_GTE]: 7,
  [Operators.ESCAPED_LTE]: 7,

  // unary operators
  [Operators.PLUS]: 9,
  [Operators.MINUS]: 9,
  [Operators.TIMES]: 10,
  [Operators.DIVIDE]: 10,
  [Operators.PERCENT]: 10,

  // Custom
  [Operators.BUILT_IN]: 11,
} as const;

// Get return the longest key length of any object
export function getMaxKeyLength(obj: object): number {
  let maxLen = 0;
  let len;
  for (const key of Object.keys(obj)) {
    len = key.length;
    if (len > maxLen) {
      maxLen = len;
    }
  }
  return maxLen;
}

export const maxBinaryOps = getMaxKeyLength(BinaryOps);
export const maxUnaryOps = getMaxKeyLength(UnaryOps);
