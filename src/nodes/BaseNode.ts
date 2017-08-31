import NodeError from '../errors/NodeError'
import { INodeConfig, NodeConfig } from '../NodeConfig'
import { ENodeType, EType } from '../Types'

export class BaseNode {
  public type : string
  public $nodeType : ENodeType
  public start : number
  public end : number
  public $config : INodeConfig

  constructor (nodeType : string, start : number, end : number, eType : EType) {
    this.type = this.constructor.name
    this.$nodeType = nodeType as ENodeType
    this.start = start
    this.end = end
    this.$config = NodeConfig[eType]
    if (!this.$config) {
      throw new NodeError(`Invalid Token`, this, null) // TODO: add more info like location
    }
  }

  public addChild (node : BaseNode) : BaseNode {
    throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this, null)
  }
}
