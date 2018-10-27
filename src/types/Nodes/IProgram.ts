import LinesAndColumns, { SourceLocation } from 'lines-and-columns'

import NodeNames from '../../enum/NodeNames'
import NodeError from '../../errors/NodeError'
import ParamError from '../../errors/ParamError'
import AbstractBodyNode from './AbstractBodyNode'

interface IErrorMessage {
  message : string
  start? : SourceLocation
  end? : SourceLocation
}

export default class IProgram extends AbstractBodyNode {
  public errors? : IErrorMessage[]

  constructor (start : number, end : number) {
    super(NodeNames.Program, { start, end })
    this.body = []
  }

  public addError (e : NodeError | ParamError, template : string) : void {
    if (!this.errors) {
      this.errors = []
    }

    const line = new LinesAndColumns(template)
    const error : IErrorMessage = {
      message: e.message,
      start: line.locationForIndex(e.start) || undefined,
      end: line.locationForIndex(e.end) || undefined,
    }

    this.errors.push(error)
  }
}
