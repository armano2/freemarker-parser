import NodeError from './errors/NodeError'
import ParserError from './errors/ParserError'

import { createNode } from './NodeHelper'
import { ISymbol, symbols, whitespaces } from './Symbols'
import { ENodeType, EType } from './Types'

import { BaseNode } from './nodes/BaseNode'
import Program from './nodes/Program'

import { Token } from './tokens/Token'

export class Parser {
  public template : string = ''
  public filename : string | null
  private cursorPos : number = 0
  private AST : Program
  private tokens : Token[] = []

  constructor () {
    this.template = ''
    this.cursorPos = 0
  }

  public parse (template : string, filename : string | null = null) : Program {
    this.template = template
    this.filename = filename
    this.tokens = []
    this.AST = new Program(0, template.length)
    this.cursorPos = 0
    this.parseTokens()
    this.buildAST()
    return this.AST
  }

  private buildAST () {
    const stack : BaseNode[] = []
    let parent : BaseNode = this.AST
    let node : BaseNode | null = null

    for (const token of this.tokens) {
      node = createNode(token)

      this.canContain(node, parent)

      if (node.$config.isSelfClosing) {
        if (token.isClose) {
          throw new NodeError(`Self closing tag can't have close tag`, node)
        }
        parent = parent.addChild(node)
      } else if (token.isClose) {
        let parentNode : BaseNode | undefined = parent
        while (parentNode) {
          if (parentNode.$nodeType === token.nodeType) {
            parentNode = stack.pop()
            break
          }
          if (!parentNode.$config.isSelfClosing) {
            throw new NodeError(`Missing close tag`, parentNode)
          }
          parentNode = stack.pop()
        }

        if (!parentNode) {
          throw new NodeError(`Closing tag is not alowed`, node)
        }
        parent = parentNode

      } else {
        parent = parent.addChild(node)
        stack.push(parent)
        parent = node
      }
    }

    if (stack.length > 0) {
      throw new NodeError(`Unclosed tag`, parent)
    }
  }

  private canContain (node : BaseNode, parent : BaseNode) {
    if (!node.canAddTo(parent)) {
      throw new NodeError(`${this.debugNode(node.$eType)} require one of parents ${this.debugNode(node.$config.onlyIn)} but found in ${this.debugNode(parent.$eType)}`, node)
    }
  }

  private debugNode (data? : string | EType[]) {
    if (!data) {
      return '[?]'
    }
    if (data instanceof Array) {
      return `[\`${data.map((it) => `${it}`).join(', ')}\`]`
    }
    return `\`${data}\``
  }

  private parseTokens () {
    while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
      const token = this.parseToken()
      if (!token) {
        this.tokens.push(this.makeToken(ENodeType.Text, this.cursorPos, this.template.length))
        break
      }
    }
  }

  private makeToken (symbol : ENodeType, startPos : number, endPos : number, type : EType = EType.Text, params : string[] = [], tag : string = '', isClose : boolean = false) : Token {
    // Get text => this.template.substring(startPos, endPos),
    return new Token(symbol, startPos, endPos, type, params, tag, isClose, type !== EType.Text ? '' : this.template.substring(startPos, endPos))
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
      this.tokens.push(this.makeToken(ENodeType.Text, this.cursorPos, startPos - 1))
    }
    this.cursorPos = startPos

    this.cursorPos += symbol.startToken.length

    let node : Token | null = null

    switch (symbol.type) {
      case ENodeType.Directive: // <#foo>/</#foo>
        node = this.parseDirective(symbol, startPos, symbol.end)
        break
      case ENodeType.Macro: // <@foo>
        node = this.parseMacro(symbol, startPos)
        break
      case ENodeType.Interpolation: // ${ foo?string }
        node = this.parseInterpolation(symbol, startPos)
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

  private parseInterpolation (symbol : ISymbol, startPos : number) : Token {
    const params : string[] = this.parseParams(symbol.endToken)
    const node = this.makeToken(ENodeType.Interpolation, startPos, this.cursorPos, EType.Interpolation, params)
    return node
  }

  private parseMacro (symbol : ISymbol, startPos : number) : Token {
    const typeString = this.parseTag(symbol.endToken)
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    const node = this.makeToken(ENodeType.Macro, startPos, this.cursorPos, EType.MacroCall, params, typeString)

    return node
  }

  private parseDirective (symbol : ISymbol, startPos : number, isClose : boolean = false) : Token {
    const typeString = this.parseTag(symbol.endToken)
    if (!(typeString in EType)) {
      throw new ParserError(`Unsupported directive ${typeString}`) // TODO: add more info like location
    }
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    const node = this.makeToken(ENodeType.Directive, startPos, this.cursorPos, typeString as EType, params, '', isClose)
    // TODO; read params

    return node
  }

  private isWhitespace (char : string) : boolean {
    return char === ' ' || char === '\t' || char === '\r' || char === '\n'
  }

  // When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
  // as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
  // Also note that if the comparison occurs inside parentheses, you will have no such problem,
  // like <#if foo.bar(x > 0)> works as expected.
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
