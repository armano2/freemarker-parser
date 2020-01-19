import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';

export default class ImportNode extends AbstractNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeNames.Import, token);
    this.params = paramParser(token);
  }
}
