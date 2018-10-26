import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IRt extends AbstractNode {
  constructor (token : IToken) {
    super(NodeNames.Rt, token)
  }
}
