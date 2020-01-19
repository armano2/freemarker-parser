import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class AttemptNode extends AbstractNode {
  public body: AbstractNode[] = [];
  public fallback?: AbstractNode[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: Token) {
    super(NodeNames.Attempt, token);
  }

  public addToNode(child: AbstractNode): void {
    this.fallback ? this.fallback.push(child) : this.body.push(child);
  }
}
