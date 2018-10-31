import { ISourceLocation } from '../interface/ISourceLocation'
import { ILoc } from '../interface/Tokens'

export default class ParseError implements ILoc {
  public message : string
  public start : number
  public end : number
  public loc? : {
    start : ISourceLocation,
    end : ISourceLocation,
  }

  constructor (message : string, el : ILoc) {
    this.message = message
    this.start = el.start
    this.end = el.end
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParseError.prototype)
  }
}
