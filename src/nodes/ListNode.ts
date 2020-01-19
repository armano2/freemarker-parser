import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class ListNode extends AbstractNode {
  public params?: Expression;
  public body: AbstractNode[];
  public fallback?: AbstractNode[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: Token) {
    super(NodeNames.List, token);
    this.params = paramParser(token);
    this.body = [];
  }

  public addToNode(child: AbstractNode): void {
    this.fallback ? this.fallback.push(child) : this.body.push(child);
  }
}
