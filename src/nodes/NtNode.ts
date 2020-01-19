import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class NtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeTypes.Nt, token);
    this.noParams(token);
  }
}
