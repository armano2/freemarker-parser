export interface IBinaryOperators {
  [n : string] : number
}

export interface IUnaryOperators {
  [n : string] : boolean
}

export interface ILiteralOperators {
  [n : string] : true | false | null
}

export enum ECharCodes {
  PERIOD_CODE = 46, // '.'
  COMMA_CODE  = 44, // ','
  SQUOTE_CODE = 39, // single quote
  DQUOTE_CODE = 34, // double quotes
  OPAREN_CODE = 40, // (
  CPAREN_CODE = 41, // )
  OBRACK_CODE = 91, // [
  CBRACK_CODE = 93, // ]
  SEMCOL_CODE = 59, // ;
  SPACE = 32, // (space)
  TAB = 9, // (tab)
  LINE_FEED = 10, // \n
  CARRIAGE_RETURN = 13, // \r
  SLASH = 47, // /
  GREATER_THAN = 62, // >
}

// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
export const binaryOps : IBinaryOperators = {
  '||': 1,
  '&&': 2,
  '^': 4,
  '&': 5,
  '==': 6, '!=': 6, '===': 6, '!==': 6,
  '<': 7, '>': 7, '<=': 7, '>=': 7, 'gt': 7, 'lt': 7, 'gte': 7, 'lte': 7,
  '+': 9, '-': 9,
  '*': 10, '/': 10, '%': 10,
}

export function isDecimalDigit (ch : number) : boolean {
  return ch >= 48 && ch <= 57 // 0...9
}

export function isLetter (ch : number) : boolean {
  return (ch >= 65 && ch <= 90) || // a...z
  (ch >= 97 && ch <= 122) // A...Z
}

export function isWhitespace (ch : number) : boolean {
  return ch === ECharCodes.SPACE || ch === ECharCodes.TAB || ch === ECharCodes.CARRIAGE_RETURN || ch === ECharCodes.LINE_FEED
}

// any non-ASCII that is not an operator
export function isIdentifierStart (ch : number) : boolean {
  return (
    isLetter(ch) ||
    (ch === 36) || (ch === 95) || // `$` and `_`
    ch >= 128
  ) && !binaryOps[String.fromCharCode(ch)]
}

// any non-ASCII that is not an operator
export function isIdentifierPart (ch : number) : boolean {
  return (
    isLetter(ch) ||
    isDecimalDigit(ch) ||
    (ch === 36) || (ch === 95) || // `$` and `_`
    ch >= 128
  ) && !binaryOps[String.fromCharCode(ch)]
}

// Use a quickly-accessible map to store all of the unary operators
export const unaryOps : IUnaryOperators = {
  '-': true,
  '!': true,
  '~': true,
  '+': true,
  '?': true,
  '=': true,
  '+=': true,
  '-=': true,
  '*=': true,
  '/=': true,
  '%=': true,
  '--': true,
  '++': true,
}

// Get return the longest key length of any object
function getMaxKeyLen (obj : object) : number {
  let maxLen = 0
  let len
  for (const key of Object.keys(obj)) {
    len = key.length
    if (len > maxLen) {
      maxLen = len
    }
  }
  return maxLen
}

export const maxUnopLen = getMaxKeyLen(unaryOps)
export const maxBinopLen = getMaxKeyLen(binaryOps)

// Store the values to return for the various literals we may encounter
export const literals : ILiteralOperators = {
  true: true,
  false: false,
  null: null,
}
