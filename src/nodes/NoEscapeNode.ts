import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class NoEscapeNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeTypes.NoEscape, token);
    this.noParams(token);
    this.body = [];
  }
}
