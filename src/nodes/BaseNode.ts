import NodeError from '../errors/NodeError'
import { INodeConfig, NodeConfig } from '../NodeConfig'
import { ENodeType, EType } from '../Types'

export class BaseNode {
  public type : string
  public $nodeType : ENodeType
  public $eType : string
  public start : number
  public end : number

  constructor (nodeType : string, start : number, end : number, eType : EType) {
    this.type = this.constructor.name
    this.$nodeType = nodeType as ENodeType
    this.$eType = eType
    this.start = start
    this.end = end
  }

  public get $config () : INodeConfig {
    const $config = NodeConfig[this.$eType]
    if (!$config) {
      throw new NodeError(`Invalid Token`, this) // TODO: add more info like location
    }
    return $config
  }

  public canAddTo (node : BaseNode) : boolean {
    return !this.$config.onlyIn || Boolean(this.$config.onlyIn.find((item) => item === node.$eType))
  }

  public addChild (node : BaseNode) : BaseNode {
    throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this)
  }
}
