import NodeNames from '../../enum/NodeNames'
import ParseError from '../../errors/ParseError'
import AbstractBodyNode from './AbstractBodyNode'

export default class IProgram extends AbstractBodyNode {
  public errors? : ParseError[]

  constructor (start : number, end : number) {
    super(NodeNames.Program, { start, end })
    this.body = []
  }

  public addError (e : ParseError) : void {
    if (!this.errors) {
      this.errors = []
    }

    this.errors.push(e)
  }
}
