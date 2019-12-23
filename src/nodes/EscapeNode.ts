import NodeNames from '../enum/NodeNames';
import { IExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class EscapeNode extends AbstractBodyNode {
  public params?: IExpression;

  constructor(token: IToken) {
    super(NodeNames.Escape, token);
    this.params = paramParser(token);
    this.body = [];
  }
}
