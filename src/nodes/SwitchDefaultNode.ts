import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class SwitchDefaultNode extends AbstractNode {
  public consequent: AbstractNode[];

  constructor(token: Token) {
    super(NodeNames.SwitchDefault, token);
    this.noParams(token);
    this.consequent = [];
  }
}
