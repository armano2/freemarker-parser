import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractNode from './abstract/AbstractNode'

export default class BreakNode extends AbstractNode {
  constructor (token : IToken) {
    super(NodeNames.Break, token)
  }
}
