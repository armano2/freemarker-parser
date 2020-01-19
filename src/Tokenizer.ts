import AbstractTokenizer from './AbstractTokenizer';
import defaultConfig from './defaultConfig';
import ECharCodes from './enum/CharCodes';
import ParseError from './errors/ParseError';
import { Options } from './interface/Options';
import { Token } from './interface/Tokens';
import { NodeType, ParseSymbol } from './Symbols';
import { isLetter, isWhitespace } from './utils/Chars';

interface NextPos {
  pos: number;
  text: string;
}

interface Params {
  paramText: string;
  endToken: string;
}

export class Tokenizer extends AbstractTokenizer {
  protected tokens: Token[] = [];
  protected options: Options;
  protected symbols: ParseSymbol[];

  protected get openTag(): ECharCodes {
    return this.options.squareTags ? ECharCodes.OpenBracket : ECharCodes.Less;
  }

  protected get closeTag(): ECharCodes {
    return this.options.squareTags
      ? ECharCodes.CloseBracket
      : ECharCodes.Greater;
  }

  constructor(options: Options = {}) {
    super();

    this.options = {
      ...defaultConfig,
      ...options,
    };

    const openTag = String.fromCharCode(this.openTag);
    const closeTag = String.fromCharCode(this.closeTag);

    this.symbols = [
      {
        startToken: `${openTag}#--`,
        endToken: [`--${closeTag}`],
        type: NodeType.Comment,
      },
      {
        startToken: `${openTag}/#`,
        endToken: [`${closeTag}`],
        type: NodeType.CloseDirective,
      },
      {
        startToken: `${openTag}#`,
        endToken: [`${closeTag}`, `/${closeTag}`],
        type: NodeType.OpenDirective,
      },
      {
        startToken: `${openTag}/@`,
        endToken: [`${closeTag}`],
        type: NodeType.CloseMacro,
      },
      {
        startToken: `${openTag}@`,
        endToken: [`${closeTag}`, `/${closeTag}`],
        type: NodeType.OpenMacro,
      },
      // tslint:disable-next-line:no-invalid-template-strings
      { startToken: '${', endToken: ['}'], type: NodeType.Interpolation },
    ];
  }

  public parse(template: string): Token[] {
    super.init(template);

    this.tokens = [];
    while (this.index >= 0 && this.index < this.template.length) {
      this.parseTemplate();
    }

    return this.tokens;
  }

  protected getNextPos(items: string[]): NextPos {
    let pos = -1;
    let text = '';
    for (const item of items) {
      const n = this.template.indexOf(item, this.index);
      if (n >= 0 && (pos === -1 || n < pos)) {
        pos = n;
        text = item;
      }
    }
    return { pos, text };
  }

  protected parseTagName(): string {
    let text = '';
    let ch: number = this.charCodeAt(this.index);

    while (this.index < this.template.length) {
      if (isWhitespace(ch)) {
        ++this.index;
        break;
      }
      if (
        ch === this.closeTag ||
        (ch === ECharCodes.Slash &&
          this.charCodeAt(this.index + 1) === this.closeTag)
      ) {
        break;
      }
      if (
        isLetter(ch) ||
        ch === ECharCodes.Period ||
        ch === ECharCodes.Underscore
      ) {
        text += this.charAt(this.index);
        ch = this.charCodeAt(++this.index);
      } else {
        throw new ParseError(`Invalid \`${this.charAt(this.index)}\``, {
          start: this.index,
          end: this.index,
        });
      }
    }
    return text;
  }

  protected getToken(): ParseSymbol | null {
    let symbol: ParseSymbol | null = null;
    let startPos = 0;
    for (const item of this.symbols) {
      const n = this.template.indexOf(item.startToken, this.index);
      if (n === this.index && (!symbol || n < startPos)) {
        symbol = item;
        startPos = n;
      }
    }
    return symbol || null;
  }

  protected parseTemplate(): void {
    let text = '';
    const startPos = this.index;
    let ch: number;
    while (this.index < this.length) {
      ch = this.charCodeAt(this.index);
      if (ch === this.openTag || ch === ECharCodes.$) {
        const token = this.getToken();
        if (token) {
          if (text.length > 0) {
            this.addToken(NodeType.Text, startPos, this.index, text);
            text = '';
          }

          const start = this.index;
          this.index += token.startToken.length;

          switch (token.type) {
            case NodeType.Comment:
              return this.parseComment(token, start);
            case NodeType.OpenDirective:
            case NodeType.OpenMacro:
              return this.parseOpenDirectiveOrMacro(token, start);
            case NodeType.CloseDirective:
            case NodeType.CloseMacro:
              return this.parseCloseDirectiveOrMacro(token, start);
            case NodeType.Interpolation:
              return this.parseInterpolation(token, start);
          }
        }
      }
      text += this.charAt(this.index);
      ++this.index;
    }

    return this.addToken(NodeType.Text, startPos, this.index, text);
  }

  protected addToken(
    type: NodeType,
    start: number,
    end: number,
    text: string,
    startTag?: string,
    endTag?: string,
    params?: string,
  ): void {
    this.tokens.push({
      type,
      start,
      end,
      startTag,
      endTag,
      text,
      params: params || undefined,
    });
  }

  protected parseComment(symbol: ParseSymbol, start: number): void {
    const end = this.getNextPos(symbol.endToken);
    if (end.pos === -1) {
      throw new ReferenceError(`Unclosed comment`);
    }
    const text = this.template.substring(this.index, end.pos);
    this.index = end.pos + end.text.length;

    this.addToken(
      symbol.type,
      start,
      this.index,
      text,
      symbol.startToken,
      end.text,
    );
  }

  protected parseInterpolation(symbol: ParseSymbol, start: number): void {
    const params = this.parseParams(symbol.endToken);
    this.addToken(
      symbol.type,
      start,
      this.index,
      '',
      symbol.startToken,
      params.endToken,
      params.paramText,
    );
  }

  protected parseOpenDirectiveOrMacro(
    symbol: ParseSymbol,
    start: number,
  ): void {
    const typeString = this.parseTagName();
    if (typeString.length === 0) {
      throw new ParseError(`${symbol.type} name cannot be empty`, {
        start: this.index,
        end: this.index,
      });
    }

    const params = this.parseParams(symbol.endToken);
    this.addToken(
      symbol.type,
      start,
      this.index,
      typeString,
      symbol.startToken,
      params.endToken,
      params.paramText,
    );
  }

  protected parseCloseDirectiveOrMacro(
    symbol: ParseSymbol,
    start: number,
  ): void {
    const typeString = this.parseTagName();
    if (typeString.length === 0) {
      throw new ParseError(`${symbol.type} name cannot be empty`, {
        start: this.index,
        end: this.index,
      });
    }

    const params = this.parseParams(symbol.endToken);
    this.addToken(
      symbol.type,
      start,
      this.index,
      typeString,
      symbol.startToken,
      params.endToken,
      params.paramText,
    );
  }

  // When you want to test if x > 0 or x >= 0, writing <#if x > 0> and <#if x >= 0> is WRONG,
  // as the first > will close the #if tag. To work that around, write <#if x gt 0> or <#if gte 0>.
  // Also note that if the comparison occurs inside parentheses, you will have no such problem,
  // like <#if foo.bar(x > 0)> works as expected.
  protected parseParams(endTags: string[]): Params {
    let paramText = '';
    const start = this.index;
    const stack: number[] = [];
    let closeCode: number | undefined;

    while (this.index <= this.length) {
      const ch = this.charCodeAt(this.index);

      if (
        closeCode !== ECharCodes.DoubleQuote &&
        closeCode !== ECharCodes.SingleQuote
      ) {
        switch (ch) {
          case ECharCodes.SingleQuote: // '
          case ECharCodes.DoubleQuote: // "
            if (closeCode) {
              stack.push(closeCode);
            }
            closeCode = ch;
            break;
          case ECharCodes.OpenParenthesis: // (
            if (closeCode) {
              stack.push(closeCode);
            }
            closeCode = ECharCodes.CloseParenthesis;
            break;
          case ECharCodes.OpenBracket: // [
            if (closeCode) {
              stack.push(closeCode);
            }
            closeCode = ECharCodes.CloseBracket;
            break;
          case ECharCodes.CloseBracket: // ]
          case ECharCodes.CloseParenthesis: // )
            if (!closeCode || ch !== closeCode) {
              throw new ParseError(
                `To many close tags ${String.fromCharCode(ch)}`,
                { start, end: this.index },
              );
            }
            closeCode = stack.pop();
            break;
        }
      } else {
        switch (ch) {
          case ECharCodes.SingleQuote: // '
          case ECharCodes.DoubleQuote: // "
            if (closeCode === ch) {
              closeCode = stack.pop();
            }
            break;
        }
      }

      if (!closeCode) {
        const nextPos = this.getNextPos(endTags);
        if (nextPos.pos !== -1 && this.index === nextPos.pos) {
          this.index += nextPos.text.length;
          return { paramText, endToken: nextPos.text };
        } else {
          paramText += this.charAt(this.index);
          ++this.index;
        }
      } else {
        paramText += this.charAt(this.index);
        ++this.index;
      }
    }
    if (closeCode) {
      throw new ParseError(
        `Missing ${String.fromCharCode(closeCode)} close char`,
        { start, end: this.index },
      );
    }
    throw new ParseError(`Unclosed directive or macro`, {
      start,
      end: this.index,
    });
  }
}
