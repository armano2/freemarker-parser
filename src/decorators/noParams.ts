import ParseError from '../errors/ParseError';
import { Token } from '../interface/Tokens';
import AbstractNode from '../nodes/abstract/AbstractNode';

type NoParamsType = new (...args: any[]) => AbstractNode;

export default function noParams<T extends NoParamsType>(target: T): T {
  return class Final extends target {
    constructor(...args: any[]) {
      super(...args);
      if (args[0]) {
        const token = args[0] as Token;
        if (token.params) {
          throw new ParseError(
            `Unexpected parameter in ${args[0].type}`,
            token,
          );
        }
      }
    }
  };
}
