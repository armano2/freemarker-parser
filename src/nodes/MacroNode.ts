import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractBodyNode from './abstract/AbstractBodyNode';

export default class MacroNode extends AbstractBodyNode {
  public params?: Expression;

  constructor(token: Token) {
    super(NodeTypes.Macro, token);
    this.params = paramParser(token);
    this.body = [];
  }
}
