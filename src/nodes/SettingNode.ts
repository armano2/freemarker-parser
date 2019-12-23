import NodeNames from '../enum/NodeNames';
import ParamNames from '../enum/ParamNames';
import ParseError from '../errors/ParseError';
import { IAssignmentExpression } from '../interface/Params';
import { IToken } from '../interface/Tokens';
import AbstractAssign from './abstract/AbstractAssign';

export default class SettingNode extends AbstractAssign {
  public expression: IAssignmentExpression;

  constructor(token: IToken) {
    super(NodeNames.Setting, token);
    const params = this.checkParams(token);

    if (params.length === 1) {
      const param = params[0];
      if (param.type === ParamNames.AssignmentExpression) {
        this.expression = param;
        return;
      }
    }
    throw new ParseError(`Invalid parameters in ${this.type}`, token);
  }
}
