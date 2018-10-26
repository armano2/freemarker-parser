import NodeNames from '../../enum/NodeNames'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class INt extends AbstractNode {
  constructor (token : IToken) {
    super(NodeNames.Nt, token)
  }
}
