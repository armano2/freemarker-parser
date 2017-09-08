import NodeError from './errors/NodeError'
import ParamError from './errors/ParamError'
import { ENodeType, ISymbol, symbols } from './Symbols'
import { IToken } from './types/Tokens'
import { chrMatrix, ECharCodes, isLetter, isWhitespace } from './utils/Chars'
import { cToken } from './utils/Node'

interface INextPos {
  pos : number
  text : string
}

interface IParams {
  paramText : string
  endToken : string
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
      this.parseToken()
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
      if (isWhitespace(ch)) {
        ++this.cursorPos
        break
      }
      if (ch === ECharCodes.GREATER_THAN || (ch === ECharCodes.SLASH && this.charCodeAt(this.cursorPos + 1) === ECharCodes.GREATER_THAN)) {
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

  private getToken () : ISymbol | null {
    let symbol : ISymbol | null = null
    let startPos : number = 0
    for (const item of symbols) {
      const n = this.template.indexOf(item.startToken, this.cursorPos)
      if (n >= 0 && (!symbol || n < startPos)) {
        symbol = item
        startPos = n
      }
    }
    return symbol || null
  }

  private parseToken () {
    let text : string = ''
    const startPos = this.cursorPos
    let ch : number
    while (this.cursorPos < this.template.length) {
      ch = this.charCodeAt(this.cursorPos)
      if (ch === ECharCodes.LESS_THAN || ch === ECharCodes.DOLAR) { // <
        const token = this.getToken()
        if (token) {
          if (text.length > 0) {
            this.addToken(ENodeType.Text, startPos, this.cursorPos, text)
            text = ''
          }

          const start = this.cursorPos
          this.cursorPos += token.startToken.length

          switch (token.type) {
            case ENodeType.Comment: // <#-- foo -->
              return this.parseComment(token.startToken, token.endToken, start)
            case ENodeType.Directive: // <#foo> | </#foo>
              return this.parseDirective(token.startToken, token.endToken, start, Boolean(token.end))
            case ENodeType.Macro: // <@foo> | </@foo>
              return this.parseMacro(token.startToken, token.endToken, start, Boolean(token.end))
            case ENodeType.Interpolation: // ${ foo?string }
              return this.parseInterpolation(token.startToken, token.endToken, start)
          }
        }
      }
      text += this.charAt(this.cursorPos)
      ++this.cursorPos
    }

    return this.addToken(ENodeType.Text, startPos, this.cursorPos, text)
  }

  private addToken (type : ENodeType, start : number, end : number, text : string, startTag? : string, endTag? : string, params? : string, isClose : boolean = false) {
    this.tokens.push(cToken(type, start, end, text, isClose, startTag, endTag, params))
  }

  private parseComment (startToken : string, endTokens : string[], start : number) {
    const end = this.getNextPos(endTokens)
    if (end.pos === -1) {
      throw new ReferenceError(`Unclosed comment`)
    }
    const text = this.template.substring(this.cursorPos, end.pos)
    this.cursorPos = end.pos + end.text.length

    this.addToken(ENodeType.Comment, start, this.cursorPos, text, startToken, end.text)
  }

  private parseInterpolation (startToken : string, endTokens : string[], start : number) {
    const params = this.parseParams(endTokens)
    this.addToken(ENodeType.Interpolation, start, this.cursorPos, '', startToken, params.endToken, params.paramText)
  }

  private parseMacro (startToken : string, endTokens : string[], start : number, isClose : boolean) {
    const typeString = this.parseTag()
    if (typeString.length === 0) {
      throw new ParamError('Macro name cannot be empty', this.cursorPos)
    }

    const params = this.parseParams(endTokens)
    this.addToken(ENodeType.Macro, start, this.cursorPos, typeString, startToken, params.endToken, params.paramText, isClose)
  }

  private parseDirective (startToken : string, endTokens : string[], start : number, isClose : boolean) {
    const typeString = this.parseTag()
    if (typeString.length === 0) {
      throw new ParamError('Directive name cannot be empty', this.cursorPos)
    }

    const params = this.parseParams(endTokens)

    this.addToken(ENodeType.Directive, start, this.cursorPos, typeString, startToken, params.endToken, params.paramText, isClose)
  }

  // When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
  // as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
  // Also note that if the comparison occurs inside parentheses, you will have no such problem,
  // like <#if foo.bar(x > 0)> works as expected.
  private parseParams (endTags : string[]) : IParams {
    let paramText : string = ''
    const start = this.cursorPos
    const stack : number[] = []
    let lastCode : number | undefined

    while (this.cursorPos <= this.template.length) {
      const ch = this.charCodeAt(this.cursorPos)

      if (lastCode !== ECharCodes.DQUOTE_CODE && lastCode !== ECharCodes.SQUOTE_CODE) {
        switch (ch) {
          case ECharCodes.SQUOTE_CODE: // '
          case ECharCodes.DQUOTE_CODE: // "
          case ECharCodes.OPAREN_CODE: // (
          case ECharCodes.OBRACK_CODE: // [
            if (lastCode) { stack.push(lastCode) }
            lastCode = ch
            break
          case ECharCodes.CBRACK_CODE: // ]
          case ECharCodes.CPAREN_CODE: // )
            if (!lastCode || ch !== chrMatrix[lastCode]) {
              throw new NodeError(`To many close tags ${String.fromCharCode(ch)}`, { start, end: this.cursorPos})
            }
            lastCode = stack.pop()
            break
        }
      } else {
        switch (ch) {
          case ECharCodes.SQUOTE_CODE: // '
          case ECharCodes.DQUOTE_CODE: // "
            if (lastCode === ch) {
              lastCode = stack.pop()
            }
            break
        }
      }

      if (!lastCode) {
        const nextPos = this.getNextPos(endTags)
        if (nextPos.pos !== -1 && this.cursorPos === nextPos.pos) {
          this.cursorPos += nextPos.text.length
          return { paramText, endToken: nextPos.text }
        } else {
          paramText += this.charAt(this.cursorPos)
          ++this.cursorPos
        }
      } else {
        paramText += this.charAt(this.cursorPos)
        ++this.cursorPos
      }
    }
    if (lastCode) {
      throw new NodeError(`Unclosed tag ${String.fromCharCode(lastCode)}`, { start, end: this.cursorPos})
    }
    throw new NodeError(`Unclosed directive or macro`, { start, end: this.cursorPos})
  }

  private charAt (i : number) : string {
    return this.template.charAt(i)
  }

  private charCodeAt (i : number) : number {
    return this.template.charCodeAt(i)
  }
}
