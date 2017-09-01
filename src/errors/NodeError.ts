import { AllNodeTypes } from '../nodes/Types'
import { IToken } from '../tokens/Types'
import ParserError from './ParserError'

export default class NodeError extends ParserError {
  public el : AllNodeTypes | IToken

  constructor (m : string, el : AllNodeTypes | IToken) {
    m = `${el.type}(${el.start}-${el.end}) - ${m}`
    super(m)
    this.el = el
  }
}
