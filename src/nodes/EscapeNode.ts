import NodeNames from '../enum/NodeNames';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class EscapeNode extends AbstractBodyNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeNames.Escape, token);
    this.params = paramParser(token);
    this.body = [];
  }
}
