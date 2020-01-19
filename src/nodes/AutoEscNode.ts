import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class AutoEscNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeNames.AutoEsc, token);
    this.noParams(token);
    this.body = [];
  }
}
