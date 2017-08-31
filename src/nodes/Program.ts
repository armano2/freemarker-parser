import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Program extends BaseNode {
  public children : BaseNode[]

  constructor (start : number, end : number) {
    super(ENodeType.Program, start, end, EType.Program)
    this.children = []
  }

  public addChild (node : BaseNode) : BaseNode {
    this.children.push(node)
    return this
  }
}
