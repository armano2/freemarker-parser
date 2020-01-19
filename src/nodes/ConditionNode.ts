import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class ConditionNode extends AbstractNode {
  public params?: Expression;
  public consequent: AbstractNode[];
  public alternate?: AbstractNode[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: Token) {
    super(NodeNames.Condition, token);
    this.params = paramParser(token);
    this.consequent = [];
  }

  public addToNode(child: AbstractNode): void {
    this.alternate ? this.alternate.push(child) : this.consequent.push(child);
  }
}
