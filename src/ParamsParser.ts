import AbstractTokenizer from './AbstractTokenizer'
import ECharCodes from './enum/CharCodes'
import {EBinaryOps, ELiterals, EOperators, EUnaryOps, maxBinaryOps, maxUnaryOps} from './enum/Operators'
import ParamNames from './enum/ParamNames'
import ParseError from './errors/ParseError'
import {
  AllParamTypes,
  IArrayExpression,
  IAssignmentExpression,
  IBinaryExpression,
  IBuiltInExpression,
  ICallExpression,
  IIdentifier,
  ILiteral,
  ILogicalExpression,
  IMapExpression,
  IMapExpressionValues,
  IMemberExpression,
  IUnaryExpression,
  IUpdateExpression,
} from './interface/Params'
import {
  isDecimalDigit,
  isIdentifierPart,
  isIdentifierStart,
  isWhitespace,
} from './utils/Chars'

// Specify values directly
// - Strings: "Foo" or 'Foo' or "It's \"quoted\"" or 'It\'s "quoted"' or r"C:\raw\string"
// - Numbers: 123.45
// - Booleans: true, false
// - Sequences: ["foo", "bar", 123.45];Ranges: 0..9, 0..<10 (or 0..!10), 0..
// - Hashes: {"name":"green mouse", "price":150}
// Retrieving variables
// - Top-level variables: user
// - Retrieving data from a hash: user.name, user["name"]
// - Retrieving data from a sequence: products[5]
// - Special variable: .main
// String operations
// - Interpolation and concatenation: "Hello ${user}!" (or "Hello " + user + "!")
// - Getting a character: name[0]
// - String slice: Inclusive end: name[0..4], Exclusive end: name[0..<5], Length-based (lenient): name[0..*5], Remove starting: name[5..]
// Sequence operations
// - Concatenation: users + ["guest"]
// - Sequence slice: Inclusive end: products[20..29], Exclusive end: products[20..<30], Length-based (lenient): products[20..*10], Remove starting: products[20..]
// Hash operations
// - Concatenation: passwords + { "joe": "secret42" }
// - Arithmetical calculations: (x * 1.5 + 10) / 2 - y % 100
// - Comparison: x == y, x != y, x < y, x > y, x >= y, x <= y, x lt y, x lte y, x gt y, x gte y, ...etc.
// - Logical operations: !registered && (firstVisit || fromEurope)
// - Built-ins: name?upper_case, path?ensure_starts_with('/')
// - Method call: repeat("What", 3)
// Missing value handler operators:
// - Default value: name!"unknown" or (user.name)!"unknown" or name! or (user.name)!
// - Missing value test: name?? or (user.name)??
// - Assignment operators: =, +=, -=, *=, /=, %=, ++, --

interface IBiopInfo {
  value : EOperators
  prec : number
}

function isIBiopInfo (object : any) : object is IBiopInfo {
  return object && 'prec' in object
}

function isAllParamTypes (object : any) : object is AllParamTypes {
  return object && 'type' in object
}

/**
 * Returns the precedence of a binary operator or `0` if it isn't a binary operator
 * @param opVal
 */
function binaryPrecedence (opVal : EOperators) : number {
  return EBinaryOps[opVal] || 0
}

/**
 * Utility function (gets called from multiple places)
 * Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
 */
function createBinaryExpression (operator : EOperators, left : AllParamTypes, right : AllParamTypes) : IBinaryExpression | ILogicalExpression | IAssignmentExpression | IBuiltInExpression {
  switch (operator) {
    case EOperators.EQUALS:
    case EOperators.PLUS_EQUALS:
    case EOperators.MINUS_EQUALS:
    case EOperators.TIMES_EQUALS:
    case EOperators.DIV_EQUALS:
    case EOperators.MOD_EQUALS:
      return createAssignmentExpression(operator, left, right)
    case EOperators.BUILT_IN:
      return createBuiltInExpression(operator, left, right)
    case EOperators.OR:
    case EOperators.AND:
      return { type: ParamNames.LogicalExpression, operator, left, right }
    default:
      return { type: ParamNames.BinaryExpression, operator, left, right }
  }
}

function createAssignmentExpression (operator : string, left : AllParamTypes, right : AllParamTypes) : IAssignmentExpression {
  return { type: ParamNames.AssignmentExpression, operator, left, right }
}

function createBuiltInExpression (operator : string, left : AllParamTypes, right : AllParamTypes) : IBuiltInExpression {
  return { type: ParamNames.BuiltInExpression, operator, left, right }
}

function createUpdateExpression (operator : string, argument : AllParamTypes, prefix : boolean = true) : IUpdateExpression {
  return { type: ParamNames.UpdateExpression, operator, argument, prefix }
}

function createUnaryExpression (operator : string, argument : AllParamTypes | null, prefix : boolean = true) : IUnaryExpression | IUpdateExpression {
  if (!argument) {
    throw new ParseError(`Missing argument in ${prefix ? 'before' : 'after'} '${operator}'`, { start: 0, end: 0 })
  }
  switch (operator) {
    case EOperators.PLUS_PLUS:
    case EOperators.MINUS_MINUS:
      return createUpdateExpression(operator, argument, prefix)
    default:
      return { type: ParamNames.UnaryExpression, operator, argument, prefix }
  }
}

export class ParamsParser extends AbstractTokenizer {
  constructor (template : string) {
    super()
    super.init(template)
  }

  public parseExpressions () : AllParamTypes {
    let node
    const nodes = []

    while (this.index < this.length) {
      // Try to gobble each expression individually
      node = this.parseExpression()
      if (node) {
        // If we weren't able to find a binary expression and are out of room, then
        // the expression passed in probably has too much
        nodes.push(node)

        if (this.charCodeAt(this.index) === ECharCodes.Comma) {
          ++this.index
        }
      } else if (this.index < this.length) {
        throw new ParseError(`Unexpected "${this.charAt(this.index)}"`, { start: this.index, end: this.index })
      }
    }

    // If there's only one expression just try returning the expression
    if (nodes.length === 1) {
      return nodes[0]
    } else {
      return {
        type: ParamNames.Compound,
        body: nodes,
      }
    }
  }

  /**
   * The main parsing function. Much of this code is dedicated to ternary expressions
   */
  protected parseExpression () : AllParamTypes | null {
    const test = this.parseBinaryExpression()
    this.parseSpaces()
    return test
  }

  /**
   * Push `index` up to the next non-space character
   */
  protected parseSpaces () {
    let ch = this.charCodeAt(this.index)
    // space or tab
    while (isWhitespace(ch)) {
      ch = this.charCodeAt(++this.index)
    }
  }

  /**
   * Search for the operation portion of the string (e.g. `+`, `===`)
   * Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
   * and move down from 3 to 2 to 1 character until a matching binary operation is found
   * then, return that binary operation
   */
  protected parseBinaryOp () : EOperators | null {
    this.parseSpaces()
    let toCheck = this.template.substr(this.index, maxBinaryOps)
    let tcLen = toCheck.length
    while (tcLen > 0) {
      if (EBinaryOps.hasOwnProperty(toCheck)) {
        this.index += tcLen
        return toCheck as EOperators
      }
      toCheck = toCheck.substr(0, --tcLen)
    }
    return null
  }

  /**
   * This function is responsible for gobbling an individual expression,
   * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
   */
  protected parseBinaryExpression () : AllParamTypes | null {
    let node
    let biop : EOperators | null
    let prec
    let stack : Array<AllParamTypes | IBiopInfo>
    let biopInfo
    let fbiop
    let left
    let right
    let i

    // First, try to get the leftmost thing
    // Then, check to see if there's a binary operator operating on that leftmost thing
    left = this.parseToken()
    biop = this.parseBinaryOp()

    // If there wasn't a binary operator, just return the leftmost node
    if (!biop) {
      return left
    }

    if (biop === EOperators.PLUS_PLUS || biop === EOperators.MINUS_MINUS) {
      return createUnaryExpression(biop, left, false)
    }

    // Otherwise, we need to start a stack to properly place the binary operations in their
    // precedence structure
    biopInfo = {
      value: biop,
      prec: binaryPrecedence(biop),
    }

    right = this.parseToken()
    if (!right || !left) {
      throw new ParseError(`Expected expression after ${biop}`, { start: this.index, end: this.index })
    }
    stack = [left, biopInfo, right]

    /**
     * Properly deal with precedence using
     * @see http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm
     */
    while (true) {
      biop = this.parseBinaryOp()
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
        if (!isAllParamTypes(right) || !isAllParamTypes(left)) {
          break
        }
        node = createBinaryExpression(fbiop.value, left, right)
        stack.push(node)
      }

      node = this.parseToken()
      if (!node) {
        throw new ParseError(`Expected expression after ${biop}`, { start: this.index, end: this.index })
      }
      stack.push(biopInfo, node)
    }

    i = stack.length - 1
    node = stack[i]
    while (i > 1) {
      fbiop = stack[i - 1]
      left = stack[i - 2]
      if (!isIBiopInfo(fbiop) || !isAllParamTypes(left) || !isAllParamTypes(node)) {
        throw new ParseError(`Expected expression`, { start: this.index, end: this.index })
      }
      node = createBinaryExpression(fbiop.value, left, node)
      i -= 2
    }
    if (!isAllParamTypes(node)) {
      throw new ParseError(`Expected expression`, { start: this.index, end: this.index })
    }
    return node
  }

  /**
   * An individual part of a binary expression:
   * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
   */
  protected parseToken () : AllParamTypes | null {
    this.parseSpaces()
    const ch = this.charCodeAt(this.index)

    if (isDecimalDigit(ch) || ch === ECharCodes.Period) {
      // Char code 46 is a dot `.` which can start off a numeric literal
      return this.parseNumericLiteral()
    } else if (ch === ECharCodes.SingleQuote || ch === ECharCodes.DoubleQuote) {
      // Single or double quotes
      return this.parseStringLiteral()
    } else if (isIdentifierStart(ch) || ch === ECharCodes.OpenParenthesis) { // open parenthesis
      // `foo`, `bar.baz`
      return this.parseVariable()
    } else if (ch === ECharCodes.OpenBracket) {
      return this.parseArray()
    } else if (ch === ECharCodes.OpenBrace) {
      return this.parseMap()
    } else {
      let toCheck = this.template.substr(this.index, maxUnaryOps)
      let tcLen = toCheck.length
      while (tcLen > 0) {
        if (toCheck in EUnaryOps) {
          this.index += tcLen
          return createUnaryExpression(toCheck, this.parseToken(), true)
        }
        toCheck = toCheck.substr(0, --tcLen)
      }
    }
    return null
  }

  /**
   * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
   * keep track of everything in the numeric literal and then calling `parseFloat` on that string
   */
  protected parseNumericLiteral () : ILiteral {
    let rawName = ''
    let chCode
    while (isDecimalDigit(this.charCodeAt(this.index))) {
      rawName += this.charAt(this.index++)
    }

    if (this.charCodeAt(this.index) === ECharCodes.Period) { // can start with a decimal marker
      rawName += this.charAt(this.index++)

      while (isDecimalDigit(this.charCodeAt(this.index))) {
        rawName += this.charAt(this.index++)
      }
    }

    chCode = this.charCodeAt(this.index)
    // Check to make sure this isn't a variable name that start with a number (123abc)
    if (isIdentifierStart(chCode)) {
      throw new ParseError(`Variable names cannot start with a number (${rawName}${this.charAt(this.index)})`, { start: this.index, end: this.index })
    } else if (chCode === ECharCodes.Period) {
      throw new ParseError('Unexpected period', { start: this.index, end: this.index })
    }

    return {
      type: ParamNames.Literal,
      value: parseFloat(rawName),
      raw: rawName,
    }
  }

  /**
   * Parses a string literal, staring with single or double quotes with basic support for escape codes
   * e.g. `"hello world"`, `'this is\nJSEP'`
   */
  protected parseStringLiteral () : ILiteral {
    let str = ''
    const quote = this.charAt(this.index++)
    let closed = false
    let ch

    while (this.index < this.length) {
      ch = this.charAt(this.index++)
      if (ch === quote) {
        closed = true
        break
      } else if (ch === '\\') {
        // Check for all of the common escape codes
        ch = this.charAt(this.index++)
        str += `\\${ch}`
      } else {
        str += ch
      }
    }

    if (!closed) {
      throw new ParseError(`Unclosed quote after "${str}"`, { start: this.index, end: this.index })
    }

    return {
      type: ParamNames.Literal,
      value: str,
      raw: quote + str + quote,
    }
  }

  /**
   * Gobbles only identifiers
   * e.g.: `foo`, `_value`, `$x1`
   * Also, this function checks if that identifier is a literal:
   * (e.g. `true`, `false`, `null`) or `this`
   */
  protected parseIdentifier () : IIdentifier | ILiteral {
    let ch = this.charCodeAt(this.index)
    const start = this.index
    let identifier : string

    if (isIdentifierStart(ch)) {
      this.index++
    } else {
      throw new ParseError(`Unexpected ${this.charAt(this.index)}`, { start: this.index, end: this.index })
    }

    while (this.index < this.length) {
      ch = this.charCodeAt(this.index)
      if (isIdentifierPart(ch)) {
        this.index++
      } else {
        break
      }
    }
    identifier = this.template.slice(start, this.index)

    if (identifier in ELiterals) {
      return {
        type: ParamNames.Literal,
        value: ELiterals[identifier],
        raw: identifier,
      }
    } else {
      return {
        type: ParamNames.Identifier,
        name: identifier,
      }
    }
  }

  /**
   * Gobbles a list of arguments within the context of a function call
   * or array literal. This function also assumes that the opening character
   * `(` or `[` has already been gobbled, and gobbles expressions and commas
   * until the terminator character `)` or `]` is encountered.
   * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
   */
  protected parseArguments (termination : number) : AllParamTypes[] {
    let chI : number
    const args : AllParamTypes[] = []
    let node
    let closed = false
    while (this.index < this.length) {
      this.parseSpaces()
      chI = this.charCodeAt(this.index)
      if (chI === termination) { // done parsing
        closed = true
        this.index++
        break
      } else if (chI === ECharCodes.Comma) { // between expressions
        this.index++
      } else {
        node = this.parseExpression()
        if (!node || node.type === ParamNames.Compound) {
          throw new ParseError('Expected comma', { start: this.index, end: this.index })
        }
        args.push(node)
      }
    }
    if (!closed) {
      throw new ParseError(`Expected ${String.fromCharCode(termination)}`, { start: this.index, end: this.index })
    }
    return args
  }

  /**
   * Gobble a non-literal variable name. This variable name may include properties
   * e.g. `foo`, `bar.baz`, `foo['bar'].baz`
   * It also gobbles function calls:
   * e.g. `Math.acos(obj.angle)`
   */
  protected parseVariable () : AllParamTypes | null {
    let chI : number
    chI = this.charCodeAt(this.index)
    let node : AllParamTypes | null = chI === ECharCodes.OpenParenthesis
      ? this.parseGroup()
      : this.parseIdentifier()

    this.parseSpaces()
    chI = this.charCodeAt(this.index)
    while (chI === ECharCodes.Period || chI === ECharCodes.OpenBracket || chI === ECharCodes.OpenParenthesis) {
      this.index++
      if (chI === ECharCodes.Period) {
        this.parseSpaces()
        node = {
          type: ParamNames.MemberExpression,
          computed: false,
          object: node,
          property: this.parseIdentifier(),
        } as IMemberExpression
      } else if (chI === ECharCodes.OpenBracket) {
        node = {
          type: ParamNames.MemberExpression,
          computed: true,
          object: node,
          property: this.parseExpression(),
        } as IMemberExpression
        this.parseSpaces()
        chI = this.charCodeAt(this.index)
        if (chI !== ECharCodes.CloseBracket) {
          throw new ParseError('Unclosed [', { start: this.index, end: this.index })
        }
        this.index++
      } else if (chI === ECharCodes.OpenParenthesis) {
        // A function call is being made; gobble all the arguments
        node = {
          type: ParamNames.CallExpression,
          arguments: this.parseArguments(ECharCodes.CloseParenthesis),
          callee: node,
        } as ICallExpression
      }
      this.parseSpaces()
      chI = this.charCodeAt(this.index)
    }
    return node
  }

  /**
   * Responsible for parsing a group of things within parentheses `()`
   * This function assumes that it needs to gobble the opening parenthesis
   * and then tries to gobble everything within that parenthesis, assuming
   * that the next thing it should see is the close parenthesis. If not,
   * then the expression probably doesn't have a `)`
   */
  protected parseGroup () : AllParamTypes | null {
    this.index++
    const node = this.parseExpression()
    this.parseSpaces()
    if (this.charCodeAt(this.index) === ECharCodes.CloseParenthesis) {
      this.index++
      return node
    } else {
      throw new ParseError('Unclosed (', { start: this.index, end: this.index })
    }
  }

  /**
   * Responsible for parsing Array literals `[1, 2, 3]`
   * This function assumes that it needs to gobble the opening bracket
   * and then tries to gobble the expressions as arguments.
   */
  protected parseArray () : IArrayExpression {
    this.index++
    return {
      type: ParamNames.ArrayExpression,
      elements: this.parseArguments(ECharCodes.CloseBracket),
    }
  }

  /**
   * Responsible for parsing Map literals `[a: 1, b: 2, c: 3]`
   * This function assumes that it needs to gobble the opening brace
   * and then tries to gobble the expressions as arguments.
   */
  protected parseMap () : IMapExpression {
    let ch : number
    let closed = false
    const elements : IMapExpressionValues[] = []
    ++this.index
    while (this.index < this.length) {
      this.parseSpaces()

      ch = this.charCodeAt(this.index)

      if (ch === ECharCodes.CloseBrace) {
        ++this.index
        closed = true
        break
      }

      if (ch !== ECharCodes.SingleQuote && ch !== ECharCodes.DoubleQuote) {
        throw new ParseError(`Invalid character ${String.fromCharCode(ch)}`, { start: this.index, end: this.index })
      }
      const key = this.parseStringLiteral()

      this.parseSpaces()

      ch = this.charCodeAt(this.index)
      if (ch !== ECharCodes.Colon) {
        throw new ParseError(`Invalid character ${String.fromCharCode(ch)}`, { start: this.index, end: this.index })
      }
      ++this.index
      this.parseSpaces()

      const value = this.parseExpression()
      if (!value) {
        throw new ParseError(`Invalid character ${String.fromCharCode(ch)}`, { start: this.index, end: this.index })
      }

      ch = this.charCodeAt(this.index)
      if (ch === ECharCodes.Comma) {
        ++this.index
      }

      elements.push({
        key,
        value,
      })
    }

    if (!closed) {
      ch = this.charCodeAt(this.index)
      throw new ParseError('Unclosed {', { start: this.index, end: this.index })
    }

    return {
      type: ParamNames.MapExpression,
      elements,
    }
  }
}
