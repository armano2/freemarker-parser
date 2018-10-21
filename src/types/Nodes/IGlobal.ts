import NodeNames from '../../enum/NodeNames'
import ParamNames from '../../enum/ParamNames'
import { parseAssignParams } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractBodyNode from './AbstractBodyNode'
import AbstractNode from './AbstractNode'

export default class IGlobal extends AbstractBodyNode {
  public params? : IExpression[]
  public body? : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.Global, token)
    this.params = parseAssignParams(token.start, token.end, token.params)
    if (this.params && this.params.length === 1 && this.params[0].type === ParamNames.Identifier) {
      this.body = []
    }
  }
}
