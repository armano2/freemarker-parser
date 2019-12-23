import NodeNames from '../enum/NodeNames';
import { IExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class ListNode extends AbstractNode {
  public params?: IExpression;
  public body: AbstractNode[];
  public fallback?: AbstractNode[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: IToken) {
    super(NodeNames.List, token);
    this.params = paramParser(token);
    this.body = [];
  }

  public addToNode(child: AbstractNode) {
    this.fallback ? this.fallback.push(child) : this.body.push(child);
  }
}
