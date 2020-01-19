import noParams from '../decorators/noParams';
import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

@noParams
export default class AutoEscNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeNames.AutoEsc, token);
    this.body = [];
  }
}
