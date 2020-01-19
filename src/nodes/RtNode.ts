import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class RtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.Rt, token);
    this.noParams(token);
  }
}
