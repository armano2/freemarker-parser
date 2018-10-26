import AbstractTokenizer from './AbstractTokenizer'
import ECharCodes from './enum/CharCodes'
import NodeError from './errors/NodeError'
import ParamError from './errors/ParamError'
import { ENodeType, ISymbol, symbols } from './Symbols'
import { IToken } from './types/Tokens'
import { isLetter, isWhitespace } from './utils/Chars'

interface INextPos {
  pos : number
  text : string
}

interface IParams {
  paramText : string
  endToken : string
}

export enum TagSyntax {
  SQUARE = 'square',
  DEFAULT = 'default',
}

export interface ITokenizerOptions {
  tagSyntax : TagSyntax
}

export class Tokenizer extends AbstractTokenizer {
  private tokens : IToken[] = []
  private options : ITokenizerOptions

  private get openTag () : ECharCodes {
    return this.options.tagSyntax === TagSyntax.SQUARE ? ECharCodes.OpenBracket : ECharCodes.Less
  }

  private get closeTag () : ECharCodes {
    return this.options.tagSyntax === TagSyntax.SQUARE ? ECharCodes.CloseBracket : ECharCodes.Greater
  }

  constructor (options? : ITokenizerOptions) {
    super()

    this.options = {
      tagSyntax : TagSyntax.DEFAULT,
      ...options,
    }
  }

  public parse (template : string) : IToken[] {
    super.init(template)

    this.tokens = []
    while (this.index >= 0 && this.index < this.template.length) {
      this.parseTemplate()
    }

    return this.tokens
  }

  private getNextPos (items : string[]) : INextPos {
    let pos = -1
    let text = ''
    for (const item of items) {
      const n = this.template.indexOf(item, this.index)
      if (n >= 0 && (pos === -1 || n < pos)) {
        pos = n
        text = item
      }
    }
    return { pos, text }
  }

  private parseTagName () : string {
    let text : string = ''
    let ch : number = this.charCodeAt(this.index)

    while (this.index < this.template.length) {
      if (isWhitespace(ch)) {
        ++this.index
        break
      }
      if (ch === this.closeTag || (ch === ECharCodes.Slash && this.charCodeAt(this.index + 1) === this.closeTag)) {
        break
      }
      if (isLetter(ch) || ch === ECharCodes.Period || ch === ECharCodes.Underscore) {
        text += this.charAt(this.index)
        ch = this.charCodeAt(++this.index)
      } else {
        throw new ParamError(`Invalid \`${this.charAt(this.index)}\``, this.index)
      }
    }
    return text
  }

  private getToken () : ISymbol | null {
    let symbol : ISymbol | null = null
    let startPos : number = 0
    for (const item of symbols) {
      const n = this.template.indexOf(item.startToken, this.index)
      if (n === this.index && (!symbol || n < startPos)) {
        symbol = item
        startPos = n
      }
    }
    return symbol || null
  }

  private parseTemplate () {
    let text : string = ''
    const startPos = this.index
    let ch : number
    while (this.index < this.length) {
      ch = this.charCodeAt(this.index)
      if (ch === this.openTag || ch === ECharCodes.$) {
        const token = this.getToken()
        if (token) {
          if (text.length > 0) {
            this.addToken(ENodeType.Text, startPos, this.index, text)
            text = ''
          }

          const start = this.index
          this.index += token.startToken.length

          switch (token.type) {
            case ENodeType.Comment:
              return this.parseComment(token, start)
            case ENodeType.Directive:
              return this.parseDirective(token, start, Boolean(token.end))
            case ENodeType.Macro:
              return this.parseMacro(token, start, Boolean(token.end))
            case ENodeType.Interpolation:
              return this.parseInterpolation(token, start)
          }
        }
      }
      text += this.charAt(this.index)
      ++this.index
    }

    return this.addToken(ENodeType.Text, startPos, this.index, text)
  }

  private addToken (type : ENodeType, start : number, end : number, text : string, startTag? : string, endTag? : string, params? : string, isClose : boolean = false) {
    this.tokens.push({
      type,
      start,
      end,
      startTag,
      endTag,
      text,
      params: params || undefined,
      isClose,
    })
  }

  private parseComment (symbol : ISymbol, start : number) {
    const end = this.getNextPos(symbol.endToken)
    if (end.pos === -1) {
      throw new ReferenceError(`Unclosed comment`)
    }
    const text = this.template.substring(this.index, end.pos)
    this.index = end.pos + end.text.length

    this.addToken(symbol.type, start, this.index, text, symbol.startToken, end.text)
  }

  private parseInterpolation (symbol : ISymbol, start : number) {
    const params = this.parseParams(symbol.endToken)
    this.addToken(symbol.type, start, this.index, '', symbol.startToken, params.endToken, params.paramText)
  }

  private parseMacro (symbol : ISymbol, start : number, isClose : boolean) {
    const typeString = this.parseTagName()
    if (typeString.length === 0) {
      throw new ParamError('Macro name cannot be empty', this.index)
    }

    const params = this.parseParams(symbol.endToken)
    this.addToken(symbol.type, start, this.index, typeString, symbol.startToken, params.endToken, params.paramText, isClose)
  }

  private parseDirective (symbol : ISymbol, start : number, isClose : boolean) {
    const typeString = this.parseTagName()
    if (typeString.length === 0) {
      throw new ParamError('Directive name cannot be empty', this.index)
    }

    const params = this.parseParams(symbol.endToken)

    this.addToken(symbol.type, start, this.index, typeString, symbol.startToken, params.endToken, params.paramText, isClose)
  }

  // When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
  // as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
  // Also note that if the comparison occurs inside parentheses, you will have no such problem,
  // like <#if foo.bar(x > 0)> works as expected.
  private parseParams (endTags : string[]) : IParams {
    let paramText : string = ''
    const start = this.index
    const stack : number[] = []
    let closeCode : number | undefined

    while (this.index <= this.length) {
      const ch = this.charCodeAt(this.index)

      if (closeCode !== ECharCodes.DoubleQuote && closeCode !== ECharCodes.SingleQuote) {
        switch (ch) {
          case ECharCodes.SingleQuote: // '
          case ECharCodes.DoubleQuote: // "
            if (closeCode) { stack.push(closeCode) }
            closeCode = ch
            break
          case ECharCodes.OpenParenthesis: // (
            if (closeCode) { stack.push(closeCode) }
            closeCode = ECharCodes.CloseParenthesis
            break
          case ECharCodes.OpenBracket: // [
            if (closeCode) { stack.push(closeCode) }
            closeCode = ECharCodes.CloseBracket
            break
          case ECharCodes.CloseBracket: // ]
          case ECharCodes.CloseParenthesis: // )
            if (!closeCode || ch !== closeCode) {
              throw new NodeError(`To many close tags ${String.fromCharCode(ch)}`, { start, end: this.index})
            }
            closeCode = stack.pop()
            break
        }
      } else {
        switch (ch) {
          case ECharCodes.SingleQuote: // '
          case ECharCodes.DoubleQuote: // "
            if (closeCode === ch) {
              closeCode = stack.pop()
            }
            break
        }
      }

      if (!closeCode) {
        const nextPos = this.getNextPos(endTags)
        if (nextPos.pos !== -1 && this.index === nextPos.pos) {
          this.index += nextPos.text.length
          return { paramText, endToken: nextPos.text }
        } else {
          paramText += this.charAt(this.index)
          ++this.index
        }
      } else {
        paramText += this.charAt(this.index)
        ++this.index
      }
    }
    if (closeCode) {
      throw new NodeError(`Missing ${String.fromCharCode(closeCode)} close char`, { start, end: this.index})
    }
    throw new NodeError(`Unclosed directive or macro`, { start, end: this.index})
  }
}
