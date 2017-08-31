import { EType } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class UnknownDirective extends Directive {
  public children : BaseNode[]

  constructor (name : EType, params : string[], start : number, end : number) {
    super(name, params, start, end)
    this.children = []
  }

  public addChild (node : BaseNode) : BaseNode {
    this.children.push(node)
    return this
  }
}
