import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class StopNode extends AbstractNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeTypes.Stop, token);
    this.noParams(token);
    this.params = paramParser(token);
  }
}
