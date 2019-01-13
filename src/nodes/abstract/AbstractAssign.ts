import ParamNames from '../../enum/ParamNames'
import ParseError from '../../errors/ParseError'
import { AllParamTypes } from '../../interface/Params'
import { IToken } from '../../interface/Tokens'
import { paramParser } from '../../utils/Params'
import AbstractBodyNode from './AbstractBodyNode'

export default abstract class AbstractAssign extends AbstractBodyNode {
  protected checkParams (token : IToken) : AllParamTypes[] {
    const params = paramParser(token)
    if (params) {
      const result = []
      if (params.type === ParamNames.Compound) {
        for (const param of params.body) {
          result.push(this.isAssignmentExpression(param, token))
        }
      } else {
        result.push(this.isAssignmentExpressionSingle(params, token))
      }
      return result
    }
    throw new ParseError(`${this.type} require params`, token)
  }

  protected isAssignmentExpressionSingle (param : AllParamTypes, token : IToken) : AllParamTypes {
    return this.isAssignmentExpression(param, token)
  }

  protected isAssignmentExpression (param : AllParamTypes, token : IToken) : AllParamTypes {
    if (param.type === ParamNames.AssignmentExpression) {
      return param
    }
    throw new ParseError(`Invalid parameters in ${this.type}`, token)
  }
}
