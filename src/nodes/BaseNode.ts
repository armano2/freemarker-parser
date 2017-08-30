import NodeError from '../errors/NodeError'
import { INodeConfig, NodeConfig } from '../NodeConfig'
import { ENodeType, EType } from '../Types'

export class BaseNode {
  public type : ENodeType
  public start : number
  public end : number
  public children : BaseNode[]
  public cfg : INodeConfig

  constructor (nodeType : string, start : number, end : number, eType : EType) {
    this.type = nodeType as ENodeType
    this.start = start
    this.end = end
    this.children = []
    this.cfg = NodeConfig[eType]
    if (!this.cfg) {
      throw new NodeError(`Invalid Token`, this, null) // TODO: add more info like location
    }
  }
}
