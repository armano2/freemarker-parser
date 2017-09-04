export interface IBinaryOperators {
  [n : string] : number
}

export interface IUnaryOperators {
  [n : string] : boolean
}

export interface ILiteralOperators {
  [n : string] : true | false | null
}

export const PERIOD_CODE = 46 // '.'
export const COMMA_CODE  = 44 // ','
export const SQUOTE_CODE = 39 // single quote
export const DQUOTE_CODE = 34 // double quotes
export const OPAREN_CODE = 40 // (
export const CPAREN_CODE = 41 // )
export const OBRACK_CODE = 91 // [
export const CBRACK_CODE = 93 // ]
export const SEMCOL_CODE = 59 // ;

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

export function isDecimalDigit (ch : number) {
  return ch >= 48 && ch <= 57 // 0...9
}

// any non-ASCII that is not an operator
export function isIdentifierStart (ch : number) {
  return (
    (ch === 36) || (ch === 95) || // `$` and `_`
    (ch >= 65 && ch <= 90) || // a...z
    (ch >= 97 && ch <= 122) || ch >= 128 // A...Z
  ) && !binaryOps[String.fromCharCode(ch)]
}

// any non-ASCII that is not an operator
export function isIdentifierPart (ch : number) {
  return (
    (ch === 36) || (ch === 95) || // `$` and `_`
    (ch >= 65 && ch <= 90) || // 0...9
    (ch >= 97 && ch <= 122) || // A...Z
    (ch >= 48 && ch <= 57) || // a...z
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
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      len = key.length
      if (len > maxLen) {
        maxLen = len
      }
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
