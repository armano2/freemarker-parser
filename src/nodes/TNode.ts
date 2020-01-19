import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class TNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.T, token);
    this.noParams(token);
  }
}
