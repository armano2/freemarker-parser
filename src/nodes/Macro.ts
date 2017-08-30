import { ENodeType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Macro extends BaseNode {
  public name : string
  public params : string[]

  constructor (name : string, params : string[], start : number, end : number) {
    super(ENodeType.Macro, start, end, true)
    this.name = name
    this.params = params
  }
}
