import NodeNames from '../../enum/NodeNames'
import ParamNames from '../../enum/ParamNames'
import NodeError from '../../errors/NodeError'
import {IAssignmentExpression} from '../Params'
import { IToken } from '../Tokens'
import AbstractAssign from './AbstractAssign'

export default class ISetting extends AbstractAssign {
  public expression : IAssignmentExpression

  constructor (token : IToken) {
    super(NodeNames.Setting, token)
    const params = this.checkParams(token)

    if (params.length === 1) {
      const param = params[0]
      if (param.type === ParamNames.AssignmentExpression) {
        this.expression = param
        return
      }
    }
    throw new NodeError(`Invalid parameters in ${this.type}`, token)
  }
}
