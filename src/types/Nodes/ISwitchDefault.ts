import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class ISwitchDefault extends AbstractNode {
  public consequent : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.SwitchDefault, token)
    this.consequent = []
  }
}
