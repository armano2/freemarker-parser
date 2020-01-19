import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class CompressNode extends AbstractBodyNode {
  constructor(token: Token) {
    super(NodeTypes.Compress, token);
    this.noParams(token);
    this.body = [];
  }
}
