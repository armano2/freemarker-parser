import ParamError from '../errors/ParamError'
import {
  IArrayExpression,
  IBinaryExpression,
  ICallExpression,
  IExpression,
  IIdentifier,
  ILiteral,
  ILogicalExpression,
  IMemberExpression,
  IUnaryExpression,
} from './Types'

// This is the full set of types that any JSEP node can be.
// Store them here to save space when minified
const COMPOUND = 'Compound'

const IDENTIFIER = 'Identifier'
const MEMBER_EXP = 'MemberExpression'
const LITERAL = 'Literal'
const CALL_EXP = 'CallExpression'
const UNARY_EXP = 'UnaryExpression'
const BINARY_EXP = 'BinaryExpression'
const LOGICAL_EXP = 'LogicalExpression'
const ARRAY_EXP = 'ArrayExpression'

const PERIOD_CODE = 46 // '.'
const COMMA_CODE  = 44 // ','
const SQUOTE_CODE = 39 // single quote
const DQUOTE_CODE = 34 // double quotes
const OPAREN_CODE = 40 // (
const CPAREN_CODE = 41 // )
const OBRACK_CODE = 91 // [
const CBRACK_CODE = 93 // ]
const SEMCOL_CODE = 59 // ;

interface IUnaryOperators {
  [n : string] : boolean
}
interface IBinaryOperators {
  [n : string] : number
}
interface ILiteralOperators {
  [n : string] : true | false | null
}

// Operations
// ----------
const t = true // Set `t` to `true` to save space (when minified, not gzipped)

// Use a quickly-accessible map to store all of the unary operators
const unaryOps : IUnaryOperators = {'-': t, '!': t, '~': t, '+': t} // Values are set to `true` (it really doesn't matter)

// Also use a map for the binary operations but set their values to their
// binary precedence for quick reference:
// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
const binaryOps : IBinaryOperators = {
  '||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
  '==': 6, '!=': 6, '===': 6, '!==': 6,
  '<': 7,  '>': 7,  '<=': 7,  '>=': 7,
  '<<': 8,  '>>': 8, '>>>': 8,
  '+': 9, '-': 9,
  '*': 10, '/': 10, '%': 10,
}

// Get return the longest key length of any object
function getMaxKeyLen (obj : object) {
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

const maxUnopLen = getMaxKeyLen(unaryOps)
const maxBinopLen = getMaxKeyLen(binaryOps)

// Literals
// ----------
// Store the values to return for the various literals we may encounter
const literals : ILiteralOperators = {
  true: true,
  false: false,
  null: null,
}

// Returns the precedence of a binary operator or `0` if it isn't a binary operator
const binaryPrecedence = (opVal : string) : number => binaryOps[opVal] || 0

// Utility function (gets called from multiple places)
// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
function createBinaryExpression (operator : string, left : IExpression, right : IExpression) : IBinaryExpression | ILogicalExpression | IExpression {
  const type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP
  return {
    type,
    operator,
    left,
    right,
  }
}

// `ch` is a character code in the next three functions
function isDecimalDigit (ch : number) {
  return ch >= 48 && ch <= 57 // 0...9
}

// any non-ASCII that is not an operator
function isIdentifierStart (ch : number) {
  return (
    (ch === 36) || (ch === 95) || // a...z
    (ch >= 65 && ch <= 90) || // `$` and `_`
    (ch >= 97 && ch <= 122) || ch >= 128 // A...Z
  ) && !binaryOps[String.fromCharCode(ch)]
}

// any non-ASCII that is not an operator
function isIdentifierPart (ch : number) {
  return (
    (ch === 36) || (ch === 95) || // 0...9
    (ch >= 65 && ch <= 90) || // `$` and `_`
    (ch >= 97 && ch <= 122) || // A...Z
    (ch >= 48 && ch <= 57) || // a...z
    ch >= 128
  ) && !binaryOps[String.fromCharCode(ch)]
}

export class ParamParser {
  private expr : string
  private index : number

  constructor (expr : string) {
    this.expr = expr
    this.index = 0
  }
}

// Parsing
// -------
// `expr` is a string with the passed in expression
export function fooFunc (expr : string) {
  // `index` stores the character number we are currently at while `length` is a constant
  // All of the gobbles below will modify `index` as we move along
  let index : number = 0

  const charAtFunc = expr.charAt
  const charCodeAtFunc = expr.charCodeAt
  const exprI = (i : number) => charAtFunc.call(expr, i)
  const exprICode = (i : number) => charCodeAtFunc.call(expr, i)
  const length = expr.length

  // Push `index` up to the next non-space character
  function gobbleSpaces () {
    let ch = exprICode(index)
    // space or tab
    while (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
      ch = exprICode(++index)
    }
  }

  // The main parsing function. Much of this code is dedicated to ternary expressions
  function gobbleExpression () : IExpression | null {
    const test = gobbleBinaryExpression()
    gobbleSpaces()
    return test
  }

  // Search for the operation portion of the string (e.g. `+`, `===`)
  // Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
  // and move down from 3 to 2 to 1 character until a matching binary operation is found
  // then, return that binary operation
  function gobbleBinaryOp () : string | null {
    gobbleSpaces()
    let toCheck = expr.substr(index, maxBinopLen)
    let tcLen = toCheck.length
    while (tcLen > 0) {
      if (binaryOps.hasOwnProperty(toCheck)) {
        index += tcLen
        return toCheck
      }
      toCheck = toCheck.substr(0, --tcLen)
    }
    return null
  }

  interface IBiopInfo {
    value : string
    prec : number
  }

  function isIBiopInfo (object : any) : object is IBiopInfo {
    return object && 'prec' in object
  }

  function isIExpression (object : any) : object is IExpression {
    return object && 'type' in object
  }

  // This function is responsible for gobbling an individual expression,
  // e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
  function gobbleBinaryExpression () : IExpression | null {
    let node
    let biop : string | null
    let prec
    let stack : Array<IExpression | IBiopInfo>
    let biopInfo
    let fbiop
    let left
    let right
    let i

    // First, try to get the leftmost thing
    // Then, check to see if there's a binary operator operating on that leftmost thing
    left = gobbleToken()
    biop = gobbleBinaryOp()

    // If there wasn't a binary operator, just return the leftmost node
    if (!biop) {
      return left
    }

    // Otherwise, we need to start a stack to properly place the binary operations in their
    // precedence structure
    biopInfo = {
      value: biop,
      prec: binaryPrecedence(biop),
    }

    right = gobbleToken()
    if (!right || !left) {
      throw new ParamError(`Expected expression after ${biop}`, index)
    }
    stack = [left, biopInfo, right]

    // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
    while (true) {
      biop = gobbleBinaryOp()
      if (!biop) {
        break
      }

      prec = binaryPrecedence(biop)

      if (prec === 0) {
        break
      }
      biopInfo = { value: biop, prec }

      // Reduce: make a binary expression from the three topmost entries.
      while (stack.length > 2) {
        fbiop = stack[stack.length - 2]
        if (!isIBiopInfo(fbiop) || prec > fbiop.prec) {
          break
        }
        right = stack.pop()
        stack.pop()
        left = stack.pop()
        if (!isIExpression(right) || !isIExpression(left)) {
          break
        }
        node = createBinaryExpression(fbiop.value, left, right)
        stack.push(node)
      }

      node = gobbleToken()
      if (!node) {
        throw new ParamError(`Expected expression after ${biop}`, index)
      }
      stack.push(biopInfo, node)
    }

    i = stack.length - 1
    node = stack[i]
    while (i > 1) {
      fbiop = stack[i - 1]
      left = stack[i - 2]
      if (!isIBiopInfo(fbiop) || !isIExpression(left) || !isIExpression(node)) {
        throw new ParamError(`Expected expression`, index)
      }
      node = createBinaryExpression(fbiop.value, left, node)
      i -= 2
    }
    if (!isIExpression(node)) {
      throw new ParamError(`Expected expression`, index)
    }
    return node
  }

  // An individual part of a binary expression:
  // e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
  function gobbleToken () : IUnaryExpression | IExpression | null {
    let ch
    let toCheck
    let tcLen

    gobbleSpaces()
    ch = exprICode(index)

    if (isDecimalDigit(ch) || ch === PERIOD_CODE) {
      // Char code 46 is a dot `.` which can start off a numeric literal
      return gobbleNumericLiteral()
    } else if (ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
      // Single or double quotes
      return gobbleStringLiteral()
    } else if (isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
      // `foo`, `bar.baz`
      return gobbleVariable()
    } else if (ch === OBRACK_CODE) {
      return gobbleArray()
    } else {
      toCheck = expr.substr(index, maxUnopLen)
      tcLen = toCheck.length
      while (tcLen > 0) {
        if (unaryOps.hasOwnProperty(toCheck)) {
          index += tcLen
          return {
            type: UNARY_EXP,
            operator: toCheck,
            argument: gobbleToken(),
            prefix: true,
          }
        }
        toCheck = toCheck.substr(0, --tcLen)
      }

      return null
    }
  }

  // Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
  // keep track of everything in the numeric literal and then calling `parseFloat` on that string
  function gobbleNumericLiteral () : ILiteral {
    let rawName = ''
    let ch
    let chCode
    while (isDecimalDigit(exprICode(index))) {
      rawName += exprI(index++)
    }

    if (exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
      rawName += exprI(index++)

      while (isDecimalDigit(exprICode(index))) {
        rawName += exprI(index++)
      }
    }

    ch = exprI(index)
    if (ch === 'e' || ch === 'E') { // exponent marker
      rawName += exprI(index++)
      ch = exprI(index)
      if (ch === '+' || ch === '-') { // exponent sign
        rawName += exprI(index++)
      }
      while (isDecimalDigit(exprICode(index))) { // exponent itself
        rawName += exprI(index++)
      }
      if (!isDecimalDigit(exprICode(index - 1))) {
        throw new ParamError(`Expected exponent (${rawName}${exprI(index)})`, index)
      }
    }

    chCode = exprICode(index)
    // Check to make sure this isn't a variable name that start with a number (123abc)
    if (isIdentifierStart(chCode)) {
      throw new ParamError(`Variable names cannot start with a number (${rawName}${exprI(index)})`, index)
    } else if (chCode === PERIOD_CODE) {
      throw new ParamError('Unexpected period', index)
    }

    return {
      type: LITERAL,
      value: parseFloat(rawName),
      raw: rawName,
    }
  }

  // Parses a string literal, staring with single or double quotes with basic support for escape codes
  // e.g. `"hello world"`, `'this is\nJSEP'`
  function gobbleStringLiteral () : ILiteral {
    let str = ''
    const quote = exprI(index++)
    let closed = false
    let ch

    while (index < length) {
      ch = exprI(index++)
      if (ch === quote) {
        closed = true
        break
      } else if (ch === '\\') {
        // Check for all of the common escape codes
        ch = exprI(index++)
        switch (ch) {
          case 'n': str += '\n'; break
          case 'r': str += '\r'; break
          case 't': str += '\t'; break
          case 'b': str += '\b'; break
          case 'f': str += '\f'; break
          case 'v': str += '\x0B'; break
          default : str += `\\${ch}`
        }
      } else {
        str += ch
      }
    }

    if (!closed) {
      throw new ParamError(`Unclosed quote after "${str}"`, index)
    }

    return {
      type: LITERAL,
      value: str,
      raw: quote + str + quote,
    }
  }

  // Gobbles only identifiers
  // e.g.: `foo`, `_value`, `$x1`
  // Also, this function checks if that identifier is a literal:
  // (e.g. `true`, `false`, `null`) or `this`
  function gobbleIdentifier () : IIdentifier | ILiteral {
    let ch = exprICode(index)
    const start = index
    let identifier : string

    if (isIdentifierStart(ch)) {
      index++
    } else {
      throw new ParamError(`Unexpected ${exprI(index)}`, index)
    }

    while (index < length) {
      ch = exprICode(index)
      if (isIdentifierPart(ch)) {
        index++
      } else {
        break
      }
    }
    identifier = expr.slice(start, index)

    if (literals.hasOwnProperty(identifier)) {
      return {
        type: LITERAL,
        value: literals[identifier],
        raw: identifier,
      }
    } else {
      return {
        type: IDENTIFIER,
        name: identifier,
      }
    }
  }

  // Gobbles a list of arguments within the context of a function call
  // or array literal. This function also assumes that the opening character
  // `(` or `[` has already been gobbled, and gobbles expressions and commas
  // until the terminator character `)` or `]` is encountered.
  // e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
  function gobbleArguments (termination : number) : IExpression[] {
    let chI : number
    const args : IExpression[] = []
    let node
    let closed = false
    while (index < length) {
      gobbleSpaces()
      chI = exprICode(index)
      if (chI === termination) { // done parsing
        closed = true
        index++
        break
      } else if (chI === COMMA_CODE) { // between expressions
        index++
      } else {
        node = gobbleExpression()
        if (!node || node.type === COMPOUND) {
          throw new ParamError('Expected comma', index)
        }
        args.push(node)
      }
    }
    if (!closed) {
      throw new ParamError(`Expected ${String.fromCharCode(termination)}`, index)
    }
    return args
  }

  // Gobble a non-literal variable name. This variable name may include properties
  // e.g. `foo`, `bar.baz`, `foo['bar'].baz`
  // It also gobbles function calls:
  // e.g. `Math.acos(obj.angle)`
  function gobbleVariable () : IMemberExpression | IIdentifier | ILiteral | ICallExpression | IExpression | null {
    let chI : number
    chI = exprICode(index)
    let node : IExpression | IIdentifier | ILiteral | IMemberExpression | ICallExpression | null = chI === OPAREN_CODE
      ? gobbleGroup()
      : gobbleIdentifier()

    gobbleSpaces()
    chI = exprICode(index)
    while (chI === PERIOD_CODE || chI === OBRACK_CODE || chI === OPAREN_CODE) {
      index++
      if (chI === PERIOD_CODE) {
        gobbleSpaces()
        node = {
          type: MEMBER_EXP,
          computed: false,
          object: node,
          property: gobbleIdentifier(),
        }
      } else if (chI === OBRACK_CODE) {
        node = {
          type: MEMBER_EXP,
          computed: true,
          object: node,
          property: gobbleExpression(),
        }
        gobbleSpaces()
        chI = exprICode(index)
        if (chI !== CBRACK_CODE) {
          throw new ParamError('Unclosed [', index)
        }
        index++
      } else if (chI === OPAREN_CODE) {
        // A function call is being made; gobble all the arguments
        node = {
          type: CALL_EXP,
          arguments: gobbleArguments(CPAREN_CODE),
          callee: node,
        }
      }
      gobbleSpaces()
      chI = exprICode(index)
    }
    return node
  }

  // Responsible for parsing a group of things within parentheses `()`
  // This function assumes that it needs to gobble the opening parenthesis
  // and then tries to gobble everything within that parenthesis, assuming
  // that the next thing it should see is the close parenthesis. If not,
  // then the expression probably doesn't have a `)`
  function gobbleGroup () : IExpression | null {
    index++
    const node = gobbleExpression()
    gobbleSpaces()
    if (exprICode(index) === CPAREN_CODE) {
      index++
      return node
    } else {
      throw new ParamError('Unclosed (', index)
    }
  }

  // Responsible for parsing Array literals `[1, 2, 3]`
  // This function assumes that it needs to gobble the opening bracket
  // and then tries to gobble the expressions as arguments.
  function gobbleArray () : IArrayExpression {
    index++
    return {
      type: ARRAY_EXP,
      elements: gobbleArguments(CBRACK_CODE),
    }
  }

  function parse () {
    const nodes = []
    let chI : number
    let node

    while (index < length) {
      chI = exprICode(index)

      // Expressions can be separated by semicolons, commas, or just inferred without any
      // separators
      if (chI === SEMCOL_CODE || chI === COMMA_CODE) {
        index++ // ignore separators
      } else {
        // Try to gobble each expression individually
        node = gobbleExpression()
        if (node) {
          // If we weren't able to find a binary expression and are out of room, then
          // the expression passed in probably has too much
          nodes.push(node)
        } else if (index < length) {
          throw new ParamError(`Unexpected "${exprI(index)}"`, index)
        }
      }
    }

    // If there's only one expression just try returning the expression
    if (nodes.length === 1) {
      return nodes[0]
    } else {
      return {
        type: COMPOUND,
        body: nodes,
      }
    }
  }

  return parse()
}
