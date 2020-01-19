import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';

export default class FtlNode extends AbstractAssign {
  public params?: Expression[];

  constructor(token: Token) {
    super(NodeTypes.Assign, token);
    this.params = this.checkParams(token);
  }
}
