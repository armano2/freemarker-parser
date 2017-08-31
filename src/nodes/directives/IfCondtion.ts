import ParserError from '../../errors/ParserError'
import { EType } from '../../Types'
import { BaseNode } from '../BaseNode'
import Directive from '../Directive'

export default class IfCondtion extends Directive {
  public consequent : BaseNode[]
  public alternate : BaseNode[]
  private inElse : boolean
  private isElseIf : boolean

  constructor (name : EType, params : string[], start : number, end : number, isElseIf : boolean) {
    super(name, params, start, end)
    this.consequent = []
    this.alternate = []
    this.inElse = false
    this.isElseIf = isElseIf
  }

  public addChild (node : BaseNode) : BaseNode {
    if (node instanceof Directive) {
      if ((node.name === EType.else || node.name === EType.elseif) && this.inElse) {
        throw new ParserError('Unexpected token <#else>')
      }

      if (node.name === EType.else) {
        this.inElse = true
        return this
      }
      if (node.name === EType.elseif) {
        this.inElse = true
        this.pushChild(node)
        return node
      }
    }
    this.pushChild(node)
    return this
  }

  private pushChild (node : BaseNode) {
    if (this.inElse) {
      this.alternate.push(node)
    } else {
      this.consequent.push(node)
    }
  }
}
