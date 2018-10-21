import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IText extends AbstractNode {
  public text : string

  constructor (token : IToken) {
    super(NodeNames.Text, token)
    this.text = token.text
  }
}
