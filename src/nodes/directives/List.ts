import ParserError from '../../errors/ParserError'
import { EType } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class List extends Directive {
  public body : BaseNode[]
  public fallback : BaseNode[]
  protected $inElse : boolean

  constructor (name : EType, params : string[], start : number, end : number) {
    super(name, params, start, end)
    this.body = []
    this.fallback = []
    this.$inElse = false
  }

  public addChild (node : BaseNode) : BaseNode {
    if (node instanceof Directive) {
      if (node.name === EType.else) {
        if (this.$inElse) {
          throw new ParserError(`Unexpected token <#${EType.else}>`)
        }
        this.$inElse = true
        return this
      }
    }
    this.pushChild(node)
    return this
  }

  private pushChild (node : BaseNode) {
    if (this.$inElse) {
      this.fallback.push(node)
    } else {
      this.body.push(node)
    }
  }
}
