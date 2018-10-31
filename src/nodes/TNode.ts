import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractNode from './abstract/AbstractNode'

export default class TNode extends AbstractNode {
  constructor (token : IToken) {
    super(NodeNames.T, token)
  }
}
