import ParamError from './errors/ParamError'
import { ENodeType, ISymbol, symbols } from './Symbols'
import { IToken } from './types/Tokens'
import { ECharCodes, isLetter, isWhitespace } from './utils/Chars'
import { cToken } from './utils/Token'

interface INextPos {
  pos : number
  text : string
}

export class Tokenizer {
  private template : string = ''
  private tokens : IToken[] = []
  private cursorPos : number = 0

  public parse (template : string) : IToken[] {
    this.template = template
    this.tokens = []
    this.cursorPos = 0
    while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
      const token = this.parseToken()
      if (!token) {
        this.tokens.push(this.parseText(this.cursorPos, this.template.length))
        break
      }
    }

    return this.tokens
  }

  private getNextPos (items : string[]) : INextPos {
    let pos = -1
    let text = ''
    for (const item of items) {
      const n = this.template.indexOf(item, this.cursorPos)
      if (n >= 0 && (pos === -1 || n < pos)) {
        pos = n
        text = item
      }
    }
    return { pos, text }
  }

  private parseTag () : string {
    let text : string = ''
    let ch : number = this.charCodeAt(this.cursorPos)

    while (this.cursorPos < this.template.length) {
      if (isWhitespace(ch) ||
        ch === ECharCodes.GREATER_THAN ||
        (ch === ECharCodes.SLASH && this.charCodeAt(this.cursorPos + 1) === ECharCodes.GREATER_THAN)
      ) {
        break
      }
      if (isLetter(ch) || ch === ECharCodes.PERIOD_CODE) {
        text += this.charAt(this.cursorPos)
        ch = this.charCodeAt(++this.cursorPos)
      } else {
        throw new ParamError(`Invalid \`${this.charAt(this.cursorPos)}\``, this.cursorPos)
      }
    }
    return text
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

    if (startPos > this.cursorPos) {
      this.tokens.push(this.parseText(this.cursorPos, startPos))
      this.cursorPos = startPos
    }
    this.cursorPos += symbol.startToken.length

    switch (symbol.type) {
      case ENodeType.Comment: // <#-- foo -->
        this.tokens.push(this.parseComment(symbol, startPos))
        break
      case ENodeType.Directive: // <#foo>/</#foo>
        this.tokens.push(this.parseDirective(symbol, startPos, symbol.end))
        break
      case ENodeType.Macro: // <@foo>
        this.tokens.push(this.parseMacro(symbol, startPos, symbol.end))
        break
      case ENodeType.Interpolation: // ${ foo?string }
        this.tokens.push(this.parseInterpolation(symbol, startPos))
        break
    }

    return true
  }

  private parseComment (symbol : ISymbol, start : number) : IToken {
    const end = this.getNextPos(symbol.endToken)
    if (end.pos === -1) {
      throw new ReferenceError(`Unclosed comment`)
    }
    const text = this.template.substring(this.cursorPos, end.pos)
    this.cursorPos = end.pos + end.text.length
    return cToken(ENodeType.Comment, start, this.cursorPos, text, [])
  }

  private parseText (start : number, end : number) : IToken {
    return cToken(ENodeType.Text, start, end, this.template.substring(start, end))
  }

  private parseInterpolation (symbol : ISymbol, start : number) : IToken {
    const params : string[] = this.parseParams(symbol.endToken)
    return cToken(ENodeType.Interpolation, start, this.cursorPos, '', params)
  }

  private parseMacro (symbol : ISymbol, start : number, isClose : boolean) : IToken {
    const typeString = this.parseTag()
    if (typeString.length === 0) {
      throw new ParamError('Macro name cannot be empty', this.cursorPos)
    }

    const params : string[] = this.parseParams(symbol.endToken)

    return cToken(ENodeType.Macro, start, this.cursorPos, typeString, params, isClose)
  }

  private parseDirective (symbol : ISymbol, startPos : number, isClose : boolean) : IToken {
    const typeString = this.parseTag()
    if (typeString.length === 0) {
      throw new ParamError('Directive name cannot be empty', this.cursorPos)
    }

    const params : string[] = this.parseParams(symbol.endToken)

    return cToken(ENodeType.Directive, startPos, this.cursorPos, typeString, params, isClose)
  }

  // When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
  // as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
  // Also note that if the comparison occurs inside parentheses, you will have no such problem,
  // like <#if foo.bar(x > 0)> works as expected.
  private parseParams (endTags : string[]) : string[] {
    const params : string[] = []
    let paramText : string = ''
    let bracketLevel = 0
    let inString = false
    let endTag : string = ''

    while (this.cursorPos <= this.template.length) {
      const ch = this.charCodeAt(this.cursorPos)
      const char = this.charAt(this.cursorPos)
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
        const nextPos = this.getNextPos(endTags)
        if (nextPos.pos !== -1 && this.cursorPos === nextPos.pos) {
          if (paramText !== '') {
            endTag = nextPos.text
            params.push(paramText)
            paramText = ''
          }

          this.cursorPos += nextPos.text.length
          return params
        } else if (isWhitespace(ch)) {
          if (paramText !== '') {
            params.push(paramText)
            paramText = ''
          }
          ++this.cursorPos
        } else {
          paramText += char
          ++this.cursorPos
        }
      } else {
        paramText += char
        ++this.cursorPos
      }
    }
    throw new SyntaxError(`Unclosed directive or macro`) // TODO: add more info like location
  }

  private charAt (i : number) : string {
    return this.template.charAt(i)
  }

  private charCodeAt (i : number) : number {
    return this.template.charCodeAt(i)
  }
}
