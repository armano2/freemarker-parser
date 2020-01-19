import noParams from '../decorators/noParams';
import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

@noParams
export default class TNode extends AbstractNode {
  constructor(token: Token) {
    super(NodeNames.T, token);
  }
}
