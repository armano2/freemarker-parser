import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';

export default class FtlNode extends AbstractAssign {
  public params?: Expression[];

  constructor(token: Token) {
    super(NodeNames.Assign, token);
    this.params = this.checkParams(token);
  }
}
