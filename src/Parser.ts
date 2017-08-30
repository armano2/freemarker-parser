import { INode } from './Node'
import ParserError from './ParserError'
import { ISymbol, symbols, whitespaces } from './Symbols'
import { EType, ETypeSymbol } from './Types'

export class Parser {
  private pos : number = 0
  private template : string = ''
  private AST : INode

  constructor () {
    this.template = ''
    this.AST = this.makeNode(0, 0, EType.Program)
    this.pos = 0
  }

  public parseTokens () {
    while (this.pos >= 0 && this.pos < this.template.length) {
      const token = this.parseNode(this.AST)
      if (!token) {
        this.AST.childrens.push(this.makeNode(this.pos, this.template.length))
        break
      }
    }
  }

  public parse (template : string) : object {
    this.template = template
    this.AST = this.makeNode(0, 0, EType.Program)
    this.pos = 0
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
      childrens: [],
    }
  }

  private getNextWhitespacePos () : number {
    let pos = -1
    for (const item of whitespaces) {
      const n = this.template.indexOf(item, this.pos)
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
    return this.template.substring(this.pos, pos)
  }

  private parseNode (parent : INode) : boolean {
    let symbol : ISymbol | null = null
    let startPos : number = 0
    for (const item of symbols) {
      const n = this.template.indexOf(item.startToken, this.pos)
      if (n >= 0 && (!symbol || n < startPos)) {
        symbol = item,
        startPos = n
      }
    }

    if (!symbol) {
      return false
    }

    if (startPos - 1 > this.pos) {
      parent.childrens.push(this.makeNode(this.pos, startPos - 1))
      this.pos = startPos
    }

    this.pos += symbol.startToken.length

    let node : INode | null = null

    switch (symbol.type) {
      case ETypeSymbol.Directive:
        node = this.parseDirective(startPos)
        break
      case ETypeSymbol.Macro:
        node = this.parseMacro(startPos)
        break
      case ETypeSymbol.Print:
        // TODO: add support for expression
        // this.parsePrint(startPos)
        break
    }

    if (node) {
      parent.childrens.push(node)
    }

    ++this.pos
    return true
  }

  // private parsePrint (startPos : number) : INode {
  //   return
  // }

  private parseMacro (startPos : number) : INode {
    const params : string[] = []
    const typeString = this.parseTag()
    this.pos += typeString.length
    // TODO; read params

    const node = this.makeNode(startPos, this.pos, EType.MacroCall, params, typeString)

    return node
  }

  private parseDirective (startPos : number) : INode {
    const params : string[] = []
    const typeString = this.parseTag()
    if (!(typeString in EType)) {
      throw new ParserError(`Unsupported directive ${typeString}`) // TODO: add more info like location
    }
    this.pos += typeString.length
    // TODO; read params

    const node : INode = this.makeNode(startPos, this.pos, typeString as EType, params)

    return node
  }
}

// When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
// as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
// Also note that if the comparison occurs inside parentheses, you will have no such problem,
// like <#if foo.bar(x > 0)> works as expected.
