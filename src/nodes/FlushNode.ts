import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class FlushNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.Flush, token);
    this.noParams(token);
  }
}
