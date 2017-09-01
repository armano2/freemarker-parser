import { ENodeType, EType, IParams } from '../Types'
import { BaseNode } from './BaseNode'

export default class Directive extends BaseNode {
  public name : EType
  public params : IParams

  constructor (name : EType, params : IParams, start : number, end : number) {
    super(ENodeType.Directive, start, end, name)
    this.name = name
    this.params = params
  }
}
