import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class NtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.Nt, token);
    this.noParams(token);
  }
}
