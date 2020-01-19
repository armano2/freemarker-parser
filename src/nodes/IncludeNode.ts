import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class IncludeNode extends AbstractNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeNames.Include, token);
    this.params = paramParser(token);
  }
}
