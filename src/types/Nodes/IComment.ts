import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IComment extends AbstractNode {
  public text : string

  constructor (token : IToken) {
    super(NodeNames.Comment, token)
    this.text = token.text
  }
}
