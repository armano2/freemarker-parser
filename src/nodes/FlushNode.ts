import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class FlushNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.Flush, token);
    this.noParams(token);
  }
}
