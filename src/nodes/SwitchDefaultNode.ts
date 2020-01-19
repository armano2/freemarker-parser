import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class SwitchDefaultNode extends AbstractNode {
  public consequent: AbstractNode[];

  constructor(token: Token) {
    super(NodeTypes.SwitchDefault, token);
    this.noParams(token);
    this.consequent = [];
  }
}
