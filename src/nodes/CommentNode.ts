import { NodeTypes } from '../enum/NodeTypes';
import { Token } from '../interface/Tokens';
import AbstractNode from './abstract/AbstractNode';

export default class CommentNode extends AbstractNode {
  public text: string;

  constructor(token: Token) {
    super(NodeTypes.Comment, token);
    this.noParams(token);
    this.text = token.text;
  }
}
