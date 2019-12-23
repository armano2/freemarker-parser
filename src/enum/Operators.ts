export interface IBinaryOperators {
  [n: string]: number;
}

export interface IUnaryOperators {
  [n: string]: boolean;
}

export interface ILiteralOperators {
  [n: string]: boolean;
}

export enum EOperators {
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
export const ELiterals: ILiteralOperators = {
  [EOperators.TRUE]: true,
  [EOperators.FALSE]: false,
};

// Use a quickly-accessible map to store all of the unary operators
export const EUnaryOps: IUnaryOperators = {
  [EOperators.MINUS]: true,
  [EOperators.TIMES]: true,
  [EOperators.EXCLAM]: true,
  [EOperators.PLUS]: true,
  [EOperators.MINUS_MINUS]: true,
  [EOperators.PLUS_PLUS]: true,
};

/**
 * @see http://en.wikipedia.org/wiki/Order_of_operations#Programming_language
 */
export const EBinaryOps: IBinaryOperators = {
  // Assignment operators (right to left)
  [EOperators.EQUALS]: 0,
  [EOperators.PLUS_EQUALS]: 0,
  [EOperators.MINUS_EQUALS]: 0,
  [EOperators.TIMES_EQUALS]: 0,
  [EOperators.DIV_EQUALS]: 0,
  [EOperators.MOD_EQUALS]: 0,
  [EOperators.PLUS_PLUS]: 0,
  [EOperators.MINUS_MINUS]: 0,

  // Logical OR
  [EOperators.OR]: 1,

  // Logical AND
  [EOperators.AND]: 2,

  // Comparisons: equal and not equal
  [EOperators.DOUBLE_EQUALS]: 6,
  [EOperators.NOT_EQUALS]: 6,

  // Comparisons: less-than and greater-than
  [EOperators.NATURAL_GT]: 7,
  [EOperators.NATURAL_LT]: 7,
  [EOperators.NATURAL_GTE]: 7,
  [EOperators.NATURAL_LTE]: 7,

  [EOperators.ESCAPED_GT]: 7,
  [EOperators.ESCAPED_LT]: 7,
  [EOperators.ESCAPED_GTE]: 7,
  [EOperators.ESCAPED_LTE]: 7,

  // unary operators
  [EOperators.PLUS]: 9,
  [EOperators.MINUS]: 9,
  [EOperators.TIMES]: 10,
  [EOperators.DIVIDE]: 10,
  [EOperators.PERCENT]: 10,

  // Custom
  [EOperators.BUILT_IN]: 11,
};

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

export const maxBinaryOps = getMaxKeyLength(EBinaryOps);
export const maxUnaryOps = getMaxKeyLength(EUnaryOps);
