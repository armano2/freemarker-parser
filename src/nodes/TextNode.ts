import NodeNames from '../enum/NodeNames';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class TextNode extends AbstractNode {
  public text: string;

  constructor(token: Token) {
    super(NodeNames.Text, token);
    this.noParams(token);
    this.text = token.text;
  }
}
