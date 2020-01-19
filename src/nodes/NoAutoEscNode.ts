import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class NoAutoEscNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeTypes.NoAutoEsc, token);
    this.noParams(token);
    this.body = [];
  }
}
