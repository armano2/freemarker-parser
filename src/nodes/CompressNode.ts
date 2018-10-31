import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractBodyNode from './abstract/AbstractBodyNode'

export default class CompressNode extends AbstractBodyNode {
  constructor (token : IToken) {
    super(NodeNames.Compress, token)
    this.body = []
  }
}
