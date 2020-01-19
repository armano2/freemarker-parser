import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class BreakNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.Break, token);
    this.noParams(token);
  }
}
