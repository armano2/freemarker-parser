import ECharCodes from '../enum/CharCodes'

export interface IBinaryOperators {
  [n : string] : number
}

export interface IUnaryOperators {
  [n : string] : boolean
}

export interface ILiteralOperators {
  [n : string] : true | false | null
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

export function closeChar (ch : number) : ECharCodes {
  switch (ch) {
    case ECharCodes.DoubleQuote:
      return ECharCodes.DoubleQuote
    case ECharCodes.OpenParenthesis:
      return ECharCodes.CloseParenthesis
    case ECharCodes.OpenBrace:
      return ECharCodes.CloseBrace
    case ECharCodes.OpenBracket:
      return ECharCodes.CloseBracket
  }

  throw new Error(`Unknow close tag ${ch}`)
}

export function isDecimalDigit (ch : number) : boolean {
  return ch >= ECharCodes._0 && ch <= ECharCodes._9 // 0...9
}

export function isLetter (ch : number) : boolean {
  return (ch >= ECharCodes.a && ch <= ECharCodes.z) || // a...z
  (ch >= ECharCodes.A && ch <= ECharCodes.Z) // A...Z
}

export function isWhitespace (ch : number) : boolean {
  return ch === ECharCodes.Space || ch === ECharCodes.Tab || ch === ECharCodes.CarriageReturn || ch === ECharCodes.LineFeed
}

// any non-ASCII that is not an operator
export function isIdentifierStart (ch : number) : boolean {
  return (
    isLetter(ch) ||
    (ch === ECharCodes.$) || (ch === ECharCodes.Underscore) || // `$` and `_`
    ch >= 128
  ) && !binaryOps[String.fromCharCode(ch)]
}

// any non-ASCII that is not an operator
export function isIdentifierPart (ch : number) : boolean {
  return (
    isLetter(ch) ||
    isDecimalDigit(ch) ||
    (ch === ECharCodes.$) || (ch === ECharCodes.Underscore) || // `$` and `_`
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
