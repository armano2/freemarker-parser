import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class CompressNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeNames.Compress, token);
    this.noParams(token);
    this.body = [];
  }
}
