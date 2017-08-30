import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Directive extends BaseNode {
  public name : EType
  public params : string[]

  constructor (name : EType, params : string[], start : number, end : number) {
    super(ENodeType.Directive, start, end, name)
    this.name = name
    this.params = params
  }
}
