import NodeError from '../../errors/NodeError'
import { EType, IParams } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class Include extends Directive {

  constructor (name : EType, params : IParams, start : number, end : number) {
    super(name, params, start, end)
  }

  public addChild (node : BaseNode) : BaseNode {
    throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this)
  }
}
