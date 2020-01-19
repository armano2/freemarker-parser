import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class LtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.Lt, token);
    this.noParams(token);
  }
}
