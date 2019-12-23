import ParseError from '../errors/ParseError';
import { AllParamTypes } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import { ParamsParser } from '../ParamsParser';

export function paramParser(token: IToken): AllParamTypes | undefined {
  if (token.params) {
    const parser = new ParamsParser(token.params);
    try {
      return parser.parseExpressions();
    } catch (e) {
      throw new ParseError(e.message, {
        start: token.start + e.start,
        end: token.start + e.end,
      });
    }
  } else {
    return undefined;
  }
}
