import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class TNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.T, token);
    this.noParams(token);
  }
}
