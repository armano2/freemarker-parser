import { EType, ENodeType } from '../Types'

export class Token {
  public startPos : number
  public endPos : number
  public type : EType
  public symbol : ENodeType
  public params : string[]
  public tag : string
  public isClose : boolean
  public text : string

  constructor (symbol : ENodeType, startPos : number, endPos : number, type : EType = EType.Text, params : string[] = [], tag : string = '', isClose : boolean = false, text : string = '') {
    this.symbol = symbol
    this.startPos = startPos
    this.endPos = endPos
    this.type = type
    this.params = params
    this.tag = tag
    this.isClose = isClose
    this.text = text
  }
}
