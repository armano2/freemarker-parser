import NodeError from '../errors/NodeError'
import { INodeConfig, NodeConfig } from '../NodeConfig'
import { ENodeType, EType } from '../Types'

export class BaseNode {
  public type : ENodeType
  public start : number
  public end : number
  public cfg : INodeConfig

  constructor (nodeType : string, start : number, end : number, eType : EType) {
    this.type = nodeType as ENodeType
    this.start = start
    this.end = end
    this.cfg = NodeConfig[eType]
    if (!this.cfg) {
      throw new NodeError(`Invalid Token`, this, null) // TODO: add more info like location
    }
  }

  public addChild (node : BaseNode) : BaseNode {
    throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.type})`, this, null)
  }
}
