import { INode } from './Node'
import ParserError from './ParserError'
import { ISymbol, symbols, whitespaces } from './Symbols'
import { EType, ETypeSymbol } from './Types'

export class Parser {
  private cursorPos : number = 0
  private template : string = ''
  private AST : INode

  constructor () {
    this.template = ''
    this.AST = this.makeNode(0, 0, EType.Program)
    this.cursorPos = 0
  }

  public parseTokens () {
    while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
      const token = this.parseNode(this.AST)
      if (!token) {
        this.AST.children.push(this.makeNode(this.cursorPos, this.template.length))
        break
      }
    }
  }

  public parse (template : string) : object {
    this.template = template
    this.AST = this.makeNode(0, 0, EType.Program)
    this.cursorPos = 0
    this.parseTokens()
    return this.AST
  }

  private makeNode (startPos : number, endPos : number, type : EType = EType.Text, params : string[] = [], tag : string = '') : INode {
    return {
      type,
      tag,
      text: type !== EType.Text ? '' : this.template.substring(startPos, endPos),
      params,
      loc: {
        startPos,
        endPos,
      },
      children: [],
    }
  }

  private getNextWhitespacePos () : number {
    let pos = -1
    for (const item of whitespaces) {
      const n = this.template.indexOf(item, this.cursorPos)
      if (n >= 0 && (pos === -1 || n < pos)) {
        pos = n
      }
    }
    return pos
  }

  private parseTag () : string {
    const pos = this.getNextWhitespacePos()
    if (pos < 0) {
      throw new ParserError('Missing closing tag') // TODO: add more info like location
    }
    return this.template.substring(this.cursorPos, pos)
  }

  private parseNode (parent : INode) : boolean {
    let symbol : ISymbol | null = null
    let startPos : number = 0
    for (const item of symbols) {
      const n = this.template.indexOf(item.startToken, this.cursorPos)
      if (n >= 0 && (!symbol || n < startPos)) {
        symbol = item,
        startPos = n
      }
    }

    if (!symbol) {
      return false
    }

    if (startPos - 1 > this.cursorPos) {
      parent.children.push(this.makeNode(this.cursorPos, startPos - 1))
    }
    this.cursorPos = startPos

    this.cursorPos += symbol.startToken.length

    let node : INode | null = null

    switch (symbol.type) {
      case ETypeSymbol.Directive: // <#foo>
        node = this.parseDirective(symbol, startPos)
        break
      case ETypeSymbol.Macro: // <@foo>
        node = this.parseMacro(symbol, startPos)
        break
      case ETypeSymbol.Interpolation: // ${ foo?string }
        node = this.parsePrint(symbol, startPos)
        break
      default:
        break
    }

    if (node) {
      parent.children.push(node)
    }

    ++this.cursorPos
    return true
  }

  private parsePrint (symbol : ISymbol, startPos : number) : INode {
    const params : string[] = this.parseParams(symbol.endToken)
    const node = this.makeNode(startPos, this.cursorPos, EType.Interpolation, params)
    return node
  }

  private parseMacro (symbol : ISymbol, startPos : number) : INode {
    const typeString = this.parseTag()
    this.cursorPos += typeString.length

    const params : string[] = this.parseParams(symbol.endToken)

    const node = this.makeNode(startPos, this.cursorPos, EType.MacroCall, params, typeString)

    return node
  }

  private parseDirective (symbol : ISymbol, startPos : number) : INode {
    const typeString = this.parseTag()
    if (!(typeString in EType)) {
      throw new ParserError(`Unsupported directive ${typeString}`) // TODO: add more info like location
    }
    this.cursorPos += typeString.length

    const params : string[] = this.parseParams(symbol.endToken)

    const node : INode = this.makeNode(startPos, this.cursorPos, typeString as EType, params)
    // TODO; read params

    return node
  }

  private isWhitespace (char : string) : boolean {
    return char === ' ' || char === '\t' || char === '\r' || char === '\n'
  }

  // foo?string
  // foo.foo
  // (foo * 2)
  // <#if "adsddsasd >"
  // <#if foo == 2>
  // "foo bar"
  // (foo > bar)
  private parseParams (engTag : string) : string[] {
    const text = this.template.substring(this.cursorPos)
    const params : string[] = []
    let paramText : string = ''
    let paramPos : number = this.cursorPos
    let bracketLevel = 0
    let inString = false

    for (const char of text) {
      if (char === '"') {
        inString = !inString
      }

      if (!inString) {
        if (char === '(') {
          ++bracketLevel
        } else if (char === ')') {
          --bracketLevel
        }
      }

      if (bracketLevel < 0) {
        throw new ParserError(`bracketLevel < 0`) // TODO: add more info like location
      }

      if (bracketLevel === 0 && !inString) {
        if (char === engTag) {
          if (paramText !== '') {
            params.push(paramText)
            paramText = ''
          }
          ++paramPos
          this.cursorPos = paramPos
          return params
        } else if (this.isWhitespace(char)) {
          if (paramText !== '') {
            params.push(paramText)
            paramText = ''
          }
          ++paramPos
          this.cursorPos = paramPos
        } else {
          paramText += char
          ++paramPos
        }
      } else {
        paramText += char
        ++paramPos
      }
    }
    throw new ParserError(`Unclosed directive or macro`) // TODO: add more info like location
  }
}

// When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
// as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
// Also note that if the comparison occurs inside parentheses, you will have no such problem,
// like <#if foo.bar(x > 0)> works as expected.
