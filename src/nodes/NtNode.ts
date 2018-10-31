import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractNode from './abstract/AbstractNode'

export default class NtNode extends AbstractNode {
  constructor (token : IToken) {
    super(NodeNames.Nt, token)
  }
}
