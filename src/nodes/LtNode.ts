import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class LtNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.Lt, token);
    this.noParams(token);
  }
}
