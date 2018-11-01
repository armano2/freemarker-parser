import NodeNames from '../enum/NodeNames'
import {IExpression} from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractBodyNode from './abstract/AbstractBodyNode'
import ParamNames from '../enum/ParamNames'
import ParseError from '../errors/ParseError'

export default class OutputFormatNode extends AbstractBodyNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.OutputFormat, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.body = []
    if (!this.params || this.params.type !== ParamNames.Literal) {
      throw new ParseError(`Invalid parameters in ${this.type}`, token)
    }
  }
}
