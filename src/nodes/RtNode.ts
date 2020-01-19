import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class RtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.Rt, token);
    this.noParams(token);
  }
}
