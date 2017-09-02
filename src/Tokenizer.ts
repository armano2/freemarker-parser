import { ENodeType, isWhitespace, ISymbol, symbols, whitespaces } from './Symbols'
import { cToken, IToken } from './tokens/Types'

export default class Tokenizer {
  private template : string = ''
  private tokens : IToken[] = []
  private cursorPos : number = 0

  public parse (template : string) : IToken[] {
    this.template = template
    while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
      const token = this.parseToken()
      if (!token) {
        this.tokens.push(this.parseText(this.cursorPos, this.template.length))
        break
      }
    }

    return this.tokens
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
      throw new SyntaxError('Missing closing tag') // TODO: add more info like location
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
      this.tokens.push(this.parseText(this.cursorPos, startPos - 1))
    }
    this.cursorPos = startPos + symbol.startToken.length

    let node : IToken | null = null

    switch (symbol.type) {
      case ENodeType.Comment: // <#-- foo -->
        node = this.parseComment(symbol, startPos)
        break
      case ENodeType.Directive: // <#foo>/</#foo>
        node = this.parseDirective(symbol, startPos, symbol.end)
        break
      case ENodeType.Macro: // <@foo>
        node = this.parseMacro(symbol, startPos, symbol.end)
        break
      case ENodeType.Interpolation: // ${ foo?string }
        node = this.parseInterpolation(symbol, startPos)
        break
      default:
        throw new ReferenceError(`Unknown node type ${symbol.type}`)
    }

    if (node) {
      this.tokens.push(node)
    }

    ++this.cursorPos
    return true
  }

  private parseComment (symbol : ISymbol, start : number) : IToken {
    const end = this.template.indexOf(symbol.endToken, this.cursorPos)
    if (end === -1) {
      throw new ReferenceError(`Unclosed comment`)
    }
    const text = this.template.substring(this.cursorPos, end)
    this.cursorPos = end + symbol.endToken.length
    return cToken(ENodeType.Comment, start, this.cursorPos, text, [])
  }

  private parseText (start : number, end : number) : IToken {
    return cToken(ENodeType.Text, start, end, this.template.substring(start, end))
  }

  private parseInterpolation (symbol : ISymbol, start : number) : IToken {
    const params : string[] = this.parseParams(symbol.endToken)
    return cToken(ENodeType.Interpolation, start, this.cursorPos, '', params)
  }

  private parseMacro (symbol : ISymbol, start : number, isClose : boolean = false) : IToken {
    const typeString = this.parseTag(symbol.endToken)
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    return cToken(ENodeType.Macro, start, this.cursorPos, typeString, params, isClose)
  }

  private parseDirective (symbol : ISymbol, startPos : number, isClose : boolean = false) : IToken {
    const typeString = this.parseTag(symbol.endToken)
    this.cursorPos += typeString.length

    const params : string[] = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken)

    return cToken(ENodeType.Directive, startPos, this.cursorPos, typeString, params, isClose)
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
        throw new SyntaxError(`bracketLevel < 0`) // TODO: add more info like location
      }

      if (bracketLevel === 0 && !inString) {
        if (char === engTag) {
          if (paramText !== '') {
            params.push(paramText)
            paramText = ''
          }
          this.cursorPos = paramPos + engTag.length
          return params
        } else if (isWhitespace(char)) {
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
    throw new SyntaxError(`Unclosed directive or macro`) // TODO: add more info like location
  }
}
