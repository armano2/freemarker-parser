import { NodeTypes } from '../enum/NodeTypes';
import ParamNames from '../enum/ParamNames';
import ParseError from '../errors/ParseError';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class OutputFormatNode extends AbstractBodyNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeTypes.OutputFormat, token);
    this.params = paramParser(token);
    this.body = [];
    if (!this.params || this.params.type !== ParamNames.Literal) {
      throw new ParseError(`Invalid parameters in ${this.type}`, token);
    }
  }
}
