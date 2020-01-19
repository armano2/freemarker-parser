import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class SwitchCaseNode extends AbstractNode {
  public params?: Expression;
  public consequent: AbstractNode[];

  constructor(token: Token) {
    super(NodeTypes.SwitchCase, token);
    this.params = paramParser(token);
    this.consequent = [];
  }
}
