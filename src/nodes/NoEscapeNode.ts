import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class NoEscapeNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeNames.NoEscape, token);
    this.noParams(token);
    this.body = [];
  }
}
