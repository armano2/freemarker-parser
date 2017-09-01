import ParserError from '../../errors/ParserError'
import { EType, IParams } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class IfCondtion extends Directive {
  public consequent : BaseNode[]
  public alternate : BaseNode[]
  protected $inElse : boolean

  constructor (name : EType, params : IParams, start : number, end : number) {
    super(name, params, start, end)
    this.consequent = []
    this.alternate = []
    this.$inElse = false
  }

  public addChild (node : BaseNode) : BaseNode {
    if (node instanceof Directive) {
      if ((node.name === EType.else || node.name === EType.elseif) && this.$inElse) {
        throw new ParserError(`Unexpected token <#${node.name}>`)
      }

      if (node.name === EType.else) {
        this.$inElse = true
        return this
      }
      if (node.name === EType.elseif) {
        this.$inElse = true
        this.pushChild(node)
        return node
      }
    }
    this.pushChild(node)
    return this
  }

  private pushChild (node : BaseNode) {
    if (this.$inElse) {
      this.alternate.push(node)
    } else {
      this.consequent.push(node)
    }
  }
}
