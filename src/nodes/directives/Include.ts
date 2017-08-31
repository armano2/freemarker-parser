import NodeError from '../../errors/NodeError'
import { EType } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class Include extends Directive {

  constructor (name : EType, params : string[], start : number, end : number) {
    super(name, params, start, end)
  }

  public addChild (node : BaseNode) : BaseNode {
    throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this)
  }
}
