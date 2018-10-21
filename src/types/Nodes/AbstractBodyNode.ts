import AbstractNode from './AbstractNode'

export default abstract class AbstractBodyNode extends AbstractNode {
  public body? : AbstractNode[]

  get hasBody () : boolean {
    return Boolean(this.body)
  }

  public addToNode (child : AbstractNode) {
    if (this.body) {
      this.body.push(child)
    } else {
      super.addToNode(child)
    }
  }
}
