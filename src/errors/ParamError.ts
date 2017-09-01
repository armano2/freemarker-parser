import ParserError from './ParserError'

export default class ParamError extends ParserError {
  public index : number
  public description : string

  constructor (message : string, index : number) {
    super(`${message} at character ${index}`)
    this.description = message
    this.index = index
  }
}
