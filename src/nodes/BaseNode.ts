import { ENodeType } from '../Types'

export class BaseNode {
  public type : ENodeType
  public isSelfClosing : boolean
  public start : number
  public end : number
  public children : BaseNode[]

  constructor (nodeType : string, start : number, end : number, isSelfClosing : boolean = false) {
    this.type = nodeType as ENodeType
    this.isSelfClosing = isSelfClosing
    this.start = start
    this.end = end
    this.children = []
  }
}
