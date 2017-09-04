import ParamError from '../errors/ParamError'
import {
  AllParamTypes,
  IArrayExpression,
  IBinaryExpression,
  ICallExpression,
  IIdentifier,
  ILiteral,
  ILogicalExpression,
  IMemberExpression,
  IUnaryExpression,
  ParamNames,
} from '../types/Params'
import {
    binaryOps,
    CBRACK_CODE,
    COMMA_CODE,
    CPAREN_CODE,
    DQUOTE_CODE,
    isDecimalDigit,
    isIdentifierPart,
    isIdentifierStart,
    literals,
    maxBinopLen,
    maxUnopLen,
    OBRACK_CODE,
    OPAREN_CODE,
    PERIOD_CODE,
    SEMCOL_CODE,
    SQUOTE_CODE,
    unaryOps,
} from '../utils/Chars'

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
  value : string
  prec : number
}

function isIBiopInfo (object : any) : object is IBiopInfo {
  return object && 'prec' in object
}

function isAllParamTypes (object : any) : object is AllParamTypes {
  return object && 'type' in object
}

// Returns the precedence of a binary operator or `0` if it isn't a binary operator
const binaryPrecedence = (opVal : string) : number => binaryOps[opVal] || 0

// Utility function (gets called from multiple places)
// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
function createBinaryExpression (operator : string, left : AllParamTypes, right : AllParamTypes) : IBinaryExpression | ILogicalExpression {
  if (operator === '||' || operator === '&&') {
    return { type: ParamNames.LogicalExpression, operator, left, right }
  } else {
    return { type: ParamNames.BinaryExpression, operator, left, right }
  }
}

export class ParamsParser {
  private expr : string
  private index : number
  private length : number

  constructor () {
    this.expr = ''
    this.index = 0
    this.length = 0
  }

  public parse (expr : string) : AllParamTypes {
    this.expr = expr
    this.index = 0
    this.length = expr.length

    const nodes = []
    let chI : number
    let node

    while (this.index < this.length) {
      chI = this.exprICode(this.index)

      // Expressions can be separated by semicolons, commas, or just inferred without any
      // separators
      if (chI === SEMCOL_CODE || chI === COMMA_CODE) {
        this.index++ // ignore separators
      } else {
        // Try to gobble each expression individually
        node = this.parseExpression()
        if (node) {
          // If we weren't able to find a binary expression and are out of room, then
          // the expression passed in probably has too much
          nodes.push(node)
        } else if (this.index < this.length) {
          throw new ParamError(`Unexpected "${this.exprI(this.index)}"`, this.index)
        }
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

  private exprI (i : number) {
    return this.expr.charAt.call(this.expr, i)
  }

  private exprICode (i : number) {
    return this.expr.charCodeAt.call(this.expr, i)
  }

  // Push `index` up to the next non-space character
  private parseSpaces () {
    let ch = this.exprICode(this.index)
    // space or tab
    while (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
      ch = this.exprICode(++this.index)
    }
  }

  // The main parsing function. Much of this code is dedicated to ternary expressions
  private parseExpression () : AllParamTypes | null {
    const test = this.parseBinaryExpression()
    this.parseSpaces()
    return test
  }

  // Search for the operation portion of the string (e.g. `+`, `===`)
  // Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
  // and move down from 3 to 2 to 1 character until a matching binary operation is found
  // then, return that binary operation
  private parseBinaryOp () : string | null {
    this.parseSpaces()
    let toCheck = this.expr.substr(this.index, maxBinopLen)
    let tcLen = toCheck.length
    while (tcLen > 0) {
      if (binaryOps.hasOwnProperty(toCheck)) {
        this.index += tcLen
        return toCheck
      }
      toCheck = toCheck.substr(0, --tcLen)
    }
    return null
  }

  // This function is responsible for gobbling an individual expression,
  // e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
  private parseBinaryExpression () : AllParamTypes | null {
    let node
    let biop : string | null
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

    // Otherwise, we need to start a stack to properly place the binary operations in their
    // precedence structure
    biopInfo = {
      value: biop,
      prec: binaryPrecedence(biop),
    }

    right = this.parseToken()
    if (!right || !left) {
      throw new ParamError(`Expected expression after ${biop}`, this.index)
    }
    stack = [left, biopInfo, right]

    // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
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
        throw new ParamError(`Expected expression after ${biop}`, this.index)
      }
      stack.push(biopInfo, node)
    }

    i = stack.length - 1
    node = stack[i]
    while (i > 1) {
      fbiop = stack[i - 1]
      left = stack[i - 2]
      if (!isIBiopInfo(fbiop) || !isAllParamTypes(left) || !isAllParamTypes(node)) {
        throw new ParamError(`Expected expression`, this.index)
      }
      node = createBinaryExpression(fbiop.value, left, node)
      i -= 2
    }
    if (!isAllParamTypes(node)) {
      throw new ParamError(`Expected expression`, this.index)
    }
    return node
  }

  // An individual part of a binary expression:
  // e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
  private parseToken () : AllParamTypes | null {
    let ch
    let toCheck
    let tcLen

    this.parseSpaces()
    ch = this.exprICode(this.index)

    if (isDecimalDigit(ch) || ch === PERIOD_CODE) {
      // Char code 46 is a dot `.` which can start off a numeric literal
      return this.parseNumericLiteral()
    } else if (ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
      // Single or double quotes
      return this.parseStringLiteral()
    } else if (isIdentifierStart(ch) || ch === OPAREN_CODE) { // open parenthesis
      // `foo`, `bar.baz`
      return this.parseVariable()
    } else if (ch === OBRACK_CODE) {
      return this.parseArray()
    } else {
      toCheck = this.expr.substr(this.index, maxUnopLen)
      tcLen = toCheck.length
      while (tcLen > 0) {
        if (unaryOps.hasOwnProperty(toCheck)) {
          this.index += tcLen
          return {
            type: ParamNames.UnaryExpression,
            operator: toCheck,
            argument: this.parseToken(),
            prefix: true,
          } as IUnaryExpression
        }
        toCheck = toCheck.substr(0, --tcLen)
      }
    }
    return null
  }

  // Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
  // keep track of everything in the numeric literal and then calling `parseFloat` on that string
  private parseNumericLiteral () : ILiteral {
    let rawName = ''
    let ch
    let chCode
    while (isDecimalDigit(this.exprICode(this.index))) {
      rawName += this.exprI(this.index++)
    }

    if (this.exprICode(this.index) === PERIOD_CODE) { // can start with a decimal marker
      rawName += this.exprI(this.index++)

      while (isDecimalDigit(this.exprICode(this.index))) {
        rawName += this.exprI(this.index++)
      }
    }

    ch = this.exprI(this.index)
    if (ch === 'e' || ch === 'E') { // exponent marker
      rawName += this.exprI(this.index++)
      ch = this.exprI(this.index)
      if (ch === '+' || ch === '-') { // exponent sign
        rawName += this.exprI(this.index++)
      }
      while (isDecimalDigit(this.exprICode(this.index))) { // exponent itself
        rawName += this.exprI(this.index++)
      }
      if (!isDecimalDigit(this.exprICode(this.index - 1))) {
        throw new ParamError(`Expected exponent (${rawName}${this.exprI(this.index)})`, this.index)
      }
    }

    chCode = this.exprICode(this.index)
    // Check to make sure this isn't a variable name that start with a number (123abc)
    if (isIdentifierStart(chCode)) {
      throw new ParamError(`Variable names cannot start with a number (${rawName}${this.exprI(this.index)})`, this.index)
    } else if (chCode === PERIOD_CODE) {
      throw new ParamError('Unexpected period', this.index)
    }

    return {
      type: ParamNames.Literal,
      value: parseFloat(rawName),
      raw: rawName,
    }
  }

  // Parses a string literal, staring with single or double quotes with basic support for escape codes
  // e.g. `"hello world"`, `'this is\nJSEP'`
  private parseStringLiteral () : ILiteral {
    let str = ''
    const quote = this.exprI(this.index++)
    let closed = false
    let ch

    while (this.index < this.length) {
      ch = this.exprI(this.index++)
      if (ch === quote) {
        closed = true
        break
      } else if (ch === '\\') {
        // Check for all of the common escape codes
        ch = this.exprI(this.index++)
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
      throw new ParamError(`Unclosed quote after "${str}"`, this.index)
    }

    return {
      type: ParamNames.Literal,
      value: str,
      raw: quote + str + quote,
    }
  }

  // Gobbles only identifiers
  // e.g.: `foo`, `_value`, `$x1`
  // Also, this function checks if that identifier is a literal:
  // (e.g. `true`, `false`, `null`) or `this`
  private parseIdentifier () : IIdentifier | ILiteral {
    let ch = this.exprICode(this.index)
    const start = this.index
    let identifier : string

    if (isIdentifierStart(ch)) {
      this.index++
    } else {
      throw new ParamError(`Unexpected ${this.exprI(this.index)}`, this.index)
    }

    while (this.index < this.length) {
      ch = this.exprICode(this.index)
      if (isIdentifierPart(ch)) {
        this.index++
      } else {
        break
      }
    }
    identifier = this.expr.slice(start, this.index)

    if (literals.hasOwnProperty(identifier)) {
      return {
        type: ParamNames.Literal,
        value: literals[identifier],
        raw: identifier,
      }
    } else {
      return {
        type: ParamNames.Identifier,
        name: identifier,
      }
    }
  }

  // Gobbles a list of arguments within the context of a function call
  // or array literal. This function also assumes that the opening character
  // `(` or `[` has already been gobbled, and gobbles expressions and commas
  // until the terminator character `)` or `]` is encountered.
  // e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
  private parseArguments (termination : number) : AllParamTypes[] {
    let chI : number
    const args : AllParamTypes[] = []
    let node
    let closed = false
    while (this.index < this.length) {
      this.parseSpaces()
      chI = this.exprICode(this.index)
      if (chI === termination) { // done parsing
        closed = true
        this.index++
        break
      } else if (chI === COMMA_CODE) { // between expressions
        this.index++
      } else {
        node = this.parseExpression()
        if (!node || node.type === ParamNames.Compound) {
          throw new ParamError('Expected comma', this.index)
        }
        args.push(node)
      }
    }
    if (!closed) {
      throw new ParamError(`Expected ${String.fromCharCode(termination)}`, this.index)
    }
    return args
  }

  // Gobble a non-literal variable name. This variable name may include properties
  // e.g. `foo`, `bar.baz`, `foo['bar'].baz`
  // It also gobbles function calls:
  // e.g. `Math.acos(obj.angle)`
  private parseVariable () : AllParamTypes | null {
    let chI : number
    chI = this.exprICode(this.index)
    let node : AllParamTypes | null = chI === OPAREN_CODE
      ? this.parseGroup()
      : this.parseIdentifier()

    this.parseSpaces()
    chI = this.exprICode(this.index)
    while (chI === PERIOD_CODE || chI === OBRACK_CODE || chI === OPAREN_CODE) {
      this.index++
      if (chI === PERIOD_CODE) {
        this.parseSpaces()
        node = {
          type: ParamNames.MemberExpression,
          computed: false,
          object: node,
          property: this.parseIdentifier(),
        } as IMemberExpression
      } else if (chI === OBRACK_CODE) {
        node = {
          type: ParamNames.MemberExpression,
          computed: true,
          object: node,
          property: this.parseExpression(),
        } as IMemberExpression
        this.parseSpaces()
        chI = this.exprICode(this.index)
        if (chI !== CBRACK_CODE) {
          throw new ParamError('Unclosed [', this.index)
        }
        this.index++
      } else if (chI === OPAREN_CODE) {
        // A function call is being made; gobble all the arguments
        node = {
          type: ParamNames.CallExpression,
          arguments: this.parseArguments(CPAREN_CODE),
          callee: node,
        } as ICallExpression
      }
      this.parseSpaces()
      chI = this.exprICode(this.index)
    }
    return node
  }

  // Responsible for parsing a group of things within parentheses `()`
  // This function assumes that it needs to gobble the opening parenthesis
  // and then tries to gobble everything within that parenthesis, assuming
  // that the next thing it should see is the close parenthesis. If not,
  // then the expression probably doesn't have a `)`
  private parseGroup () : AllParamTypes | null {
    this.index++
    const node = this.parseExpression()
    this.parseSpaces()
    if (this.exprICode(this.index) === CPAREN_CODE) {
      this.index++
      return node
    } else {
      throw new ParamError('Unclosed (', this.index)
    }
  }

  // Responsible for parsing Array literals `[1, 2, 3]`
  // This function assumes that it needs to gobble the opening bracket
  // and then tries to gobble the expressions as arguments.
  private parseArray () : IArrayExpression {
    this.index++
    return {
      type: ParamNames.ArrayExpression,
      elements: this.parseArguments(CBRACK_CODE),
    }
  }
}
