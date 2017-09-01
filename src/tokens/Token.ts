import { ENodeType, EType, IParams } from '../Types'
import { parseParams } from '../utils/Params'

export class Token {
  public start : number
  public end : number
  public type : EType
  public nodeType : ENodeType
  public params : IParams
  public tag : string
  public isClose : boolean
  public text : string

  constructor (symbol : ENodeType, startPos : number, endPos : number, type : EType = EType.Text, params : string[] = [], tag : string = '', isClose : boolean = false, text : string = '') {
    this.nodeType = symbol
    this.start = startPos
    this.end = endPos
    this.type = type
    this.params = parseParams(params)
    this.tag = tag
    this.isClose = isClose
    this.text = text
  }
}
