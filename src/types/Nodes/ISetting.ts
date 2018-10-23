import NodeNames from '../../enum/NodeNames'
import ParamNames from '../../enum/ParamNames'
import NodeError from '../../errors/NodeError'
import { parseAssignParams } from '../../utils/Params'
import { IAssignmentExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class ISetting extends AbstractNode {
  public expression : IAssignmentExpression

  constructor (token : IToken) {
    super(NodeNames.Setting, token)
    const params = parseAssignParams(token.start, token.end, token.params)
    if (params && params.length === 1) {
      const expression = params[0]
      if (expression.type === ParamNames.AssignmentExpression) {
        this.expression = expression
        return
      }
    }
    throw new NodeError(`Invalid parameters in ${NodeNames.Setting}`, token)
  }
}
