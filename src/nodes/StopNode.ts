import noParams from '../decorators/noParams';
import NodeNames from '../enum/NodeNames';
import { IExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

@noParams
export default class StopNode extends AbstractNode {
  public params?: IExpression;

  constructor(token: IToken) {
    super(NodeNames.Stop, token);
    this.params = paramParser(token);
  }
}
