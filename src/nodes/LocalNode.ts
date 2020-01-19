import NodeNames from '../enum/NodeNames';
import ParamNames from '../enum/ParamNames';
import { AllParamTypes, Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';
import AbstractNode from './abstract/AbstractNode';

export default class LocalNode extends AbstractAssign {
  public params?: Expression[];
  public body?: AbstractNode[];

  constructor(token: Token) {
    super(NodeNames.Local, token);
    this.params = this.checkParams(token);

    if (
      this.params.length === 1 &&
      this.params[0].type === ParamNames.Identifier
    ) {
      this.body = [];
    }
  }

  protected isAssignmentExpressionSingle(
    param: AllParamTypes,
    token: Token,
  ): AllParamTypes {
    if (param.type === ParamNames.Identifier) {
      return param;
    }
    return super.isAssignmentExpressionSingle(param, token);
  }

  protected isAssignmentExpression(
    param: AllParamTypes,
    token: Token,
  ): AllParamTypes {
    if (param.type === ParamNames.UpdateExpression && !param.prefix) {
      return param;
    }
    return super.isAssignmentExpression(param, token);
  }
}
