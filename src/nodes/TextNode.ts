import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractNode from './abstract/AbstractNode'

export default class TextNode extends AbstractNode {
  public text : string

  constructor (token : IToken) {
    super(NodeNames.Text, token)
    this.text = token.text
  }
}
