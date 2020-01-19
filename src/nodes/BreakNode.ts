import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class BreakNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.Break, token);
    this.noParams(token);
  }
}
