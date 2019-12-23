import NodeNames from '../enum/NodeNames';
import { IExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';

export default class FtlNode extends AbstractAssign {
  public params?: IExpression[];

  constructor(token: IToken) {
    super(NodeNames.Assign, token);
    this.params = this.checkParams(token);
  }
}
