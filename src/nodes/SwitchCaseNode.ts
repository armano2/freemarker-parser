import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class SwitchCaseNode extends AbstractNode {
  public params?: Expression;
  public consequent: AbstractNode[];

  constructor(token: Token) {
    super(NodeNames.SwitchCase, token);
    this.params = paramParser(token);
    this.consequent = [];
  }
}
