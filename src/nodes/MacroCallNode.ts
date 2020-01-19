import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractBodyNode from './abstract/AbstractBodyNode';
import AbstractNode from './abstract/AbstractNode';

export default class MacroCallNode extends AbstractBodyNode {
  public params?: Expression;
  public name: string;
  public body?: AbstractNode[];

  constructor(token: Token) {
    super(NodeTypes.MacroCall, token);
    this.name = token.text;
    this.params = paramParser(token);
    if (token.endTag !== '/>') {
      this.body = [];
    }
  }
}
