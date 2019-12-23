import NodeNames from '../enum/NodeNames';
import ParamNames from '../enum/ParamNames';
import { AllParamTypes, IExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';
import AbstractNode from './abstract/AbstractNode';

export default class GlobalNode extends AbstractAssign {
  public params?: IExpression[];
  public body?: AbstractNode[];

  constructor(token: IToken) {
    super(NodeNames.Global, token);
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
    token: IToken,
  ): AllParamTypes {
    if (param.type === ParamNames.Identifier) {
      return param;
    }
    return super.isAssignmentExpressionSingle(param, token);
  }

  protected isAssignmentExpression(
    param: AllParamTypes,
    token: IToken,
  ): AllParamTypes {
    if (param.type === ParamNames.UpdateExpression && !param.prefix) {
      return param;
    }
    return super.isAssignmentExpression(param, token);
  }
}
