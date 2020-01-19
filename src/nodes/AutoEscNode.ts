import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class AutoEscNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeTypes.AutoEsc, token);
    this.noParams(token);
    this.body = [];
  }
}
