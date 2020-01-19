import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class ItemsNode extends AbstractNode {
  public params?: Expression;
  public body: AbstractNode[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: Token) {
    super(NodeTypes.Items, token);
    this.params = paramParser(token);
    this.body = [];
  }

  public addToNode(child: AbstractNode): void {
    this.body.push(child);
  }
}
