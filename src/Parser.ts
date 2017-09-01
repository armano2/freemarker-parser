import { IBaseNode, INode, IToken } from './Node'
import { INodeConfig, NodeConfig } from './NodeConfig'
import ParserError from './ParserError'
import { ISymbol, symbols, whitespaces } from './Symbols'
import { EType, ETypeSymbol } from './Types'

export class Parser {
  private cursorPos : number = 0
  private template : string = ''
  private AST : IBaseNode
  private tokens : IToken[] = []

  constructor () {
    this.template = ''
    this.cursorPos = 0
  }

  public parse (template : string) : IBaseNode {
    this.template = template
    this.tokens = []
    this.AST = {
      type: EType.Program,
      children: [],
    }
    this.cursorPos = 0
    this.parseTokens()
    this.buildAST()
    return this.AST
  }

  private getConfig (type : EType) : INodeConfig {
    const cfg = NodeConfig[type]
    if (!cfg) {
      throw new ParserError(`Invalid Token`) // TODO: add more info like location
    }
    return cfg
  }

  private buildAST () {
    const stack : IBaseNode[] = []
    let parent : IBaseNode = this.AST

    for (const token of this.tokens) {
      const cfg = this.getConfig(token.type)

      if (cfg.isSelfClosing) {
        if (token.isClose) {
          throw new ParserError(`Self closing token can't have close tag`) // TODO: add more info like location
        }
        const node = this.makeNode(token)
        parent.children.push(node)
      } else if (token.isClose) {
        let parentNode : IBaseNode | undefined = parent
        while (parentNode) {
          if (parentNode.type === token.type) {
            break
          }
          const parentCfg = this.getConfig(token.type)
          if (!parentCfg.isSelfClosing) {
            throw new ParserError(`Missing close tag`) // TODO: add more info like location
          }
          parentNode = stack.pop()
        }

        if (!parentNode) {
          throw new ParserError(`Closing tag is not alowed here`) // TODO: add more info like location
        }
        parentNode = stack.pop()
        if (!parentNode) {
          throw new ParserError(`Closing tag is not alowed here`) // TODO: add more info like location
        }
        parent = parentNode

      } else {
        const node = this.makeNode(token)
        parent.children.push(node)
        stack.push(parent)
        parent = node
      }
    }

    if (stack.length > 0) {
      throw new ParserError(`Unclosed tag`) // TODO: add more info like location
    }
  }

  private parseTokens () {
    while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
      const token = this.parseToken()
      if (!token) {
        this.tokens.push(this.makeToken(this.cursorPos, this.template.length))
        break
      }
    }
  }

  private makeToken (startPos : number, endPos : number, type : EType = EType.Text, params : string[] = [], tag : string = '', isClose : boolean = false) : IToken {
    return {
      type,
      isClose,
      tag,
      text: type !== EType.Text ? '' : this.template.substring(startPos, endPos),
      params,
      loc: {
        startPos,
        endPos,
      },
    }
  }

  private makeNode (token : IToken) : INode {
    return {
      type: token.type,
      tag: token.tag,
      text: token.text,
      params: token.params,
      loc: token.loc,
      children: [],
    }
  }

  private getNextPos (items : string[]) : number {
    let pos = -1
    for (const item of items) {
      const n = this.template.indexOf(item, this.cursorPos)
      if (n >= 0 && (pos === -1 || n < pos)) {
        pos = n
      }
    }
    return pos
  }

  private parseTag (endTag : string) : string {
    const pos = this.getNextPos([
      ...whitespaces,
      endTag,
    ])
    if (pos < 0) {
      throw new ParserError('Missing closing tag') // TODO: add more info like location
    }
    return this.template.substring(this.cursorPos, pos)
  }

  private parseToken () : boolean {
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
      this.tokens.push(this.makeToken(this.cursorPos, startPos - 1))
    }
    this.cursorPos = startPos

    this.cursorPos += symbol.startToken.length

    let node : IToken | null = null

    switch (symbol.type) {
      case ETypeSymbol.Directive: // <#foo>
        node = this.parseDirective(symbol, startPos)
        break
      case ETypeSymbol.DirectiveEnd: // </#foo>
        node = this.parseDirective(symbol, startPos, true)
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
      this.tokens.push(node)
    }

    ++this.cursorPos
    return true
  }

  private parsePrint (symbol : ISymbol, startPos : number) : IToken {
    const params : string[] = this.parseParams(symbol.endToken)
    const node = this.makeToken(startPos, this.cursorPos, EType.Interpolation, params)
    return node
  }

  private parseMacro (symbol : ISymbol, startPos : number) : IToken {
    const typeString = this.parseTag(symbol.endToken)
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    const node = this.makeToken(startPos, this.cursorPos, EType.MacroCall, params, typeString)

    return node
  }

  private parseDirective (symbol : ISymbol, startPos : number, isClose : boolean = false) : IToken {
    const typeString = this.parseTag(symbol.endToken)
    if (!(typeString in EType)) {
      throw new ParserError(`Unsupported directive ${typeString}`) // TODO: add more info like location
    }
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    const node = this.makeToken(startPos, this.cursorPos, typeString as EType, params, '', isClose)
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
          this.cursorPos = paramPos + engTag.length
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
