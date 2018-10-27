import { ILoc } from '../types/Tokens'

export default class ParamError extends SyntaxError implements ILoc {
  public start : number
  public end : number

  constructor (message : string, start : number) {
    super(message)
    this.start = start
    this.end = start
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParamError.prototype)
  }
}
