import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractBodyNode from './AbstractBodyNode'

export default class ICompress extends AbstractBodyNode {
  constructor (token : IToken) {
    super(NodeNames.Compress, token)
    this.body = []
  }
}
