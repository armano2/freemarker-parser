import NodeError from './errors/NodeError'

import { createNode } from './NodeHelper'
import { EType } from './Types'

import { BaseNode } from './nodes/BaseNode'
import Program from './nodes/Program'

import Tokenizer from './Tokenizer'
import { Token } from './tokens/Token'

export class Parser {
  public template : string = ''
  private AST : Program
  private tokens : Token[]

  constructor () {
    this.template = ''
    this.tokens = []
  }

  public parse (template : string) : Program {
    this.template = template
    this.AST = new Program(0, template.length)
    this.build()
    return this.deepClone(this.AST)
  }

  private deepClone (text : Program) {
    const cache : BaseNode[] = []
    const json = JSON.stringify(text, (key, value) => {
      if (key.startsWith('$')) {
        return
      }
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return
        }
        // Store value in our collection
        cache.push(value)
      }
      return value
    }, 2)
    return JSON.parse(json)
  }

  private build () {
    const stack : BaseNode[] = []
    let parent : BaseNode = this.AST
    let node : BaseNode | null = null

    const tokenizer = new Tokenizer()
    this.tokens = tokenizer.parse(this.template)

    for (const token of this.tokens) {
      node = createNode(token)

      this.canContain(node, parent)

      if (node.$config.isSelfClosing) {
        if (token.isClose) {
          throw new NodeError(`Unexpected close tag`, node)
        }
        parent = parent.addChild(node)
      } else if (token.isClose) {
        let parentNode : BaseNode | undefined = parent
        while (parentNode) {
          if (parentNode.$nodeType === token.nodeType) {
            parentNode = stack.pop()
            break
          }
          if (!parentNode.$config.isSelfClosing) {
            throw new NodeError(`Missing close tag`, parentNode)
          }
          parentNode = stack.pop()
        }

        if (!parentNode) {
          throw new NodeError(`Closing tag is not alowed`, node)
        }
        parent = parentNode

      } else {
        parent = parent.addChild(node)
        stack.push(parent)
        parent = node
      }
    }

    if (stack.length > 0) {
      throw new NodeError(`Unclosed tag`, parent)
    }
  }

  private canContain (node : BaseNode, parent : BaseNode) {
    if (!node.canAddTo(parent)) {
      throw new NodeError(`${this.debugNode(node.$eType)} require one of parents ${this.debugNode(node.$config.onlyIn)} but found in ${this.debugNode(parent.$eType)}`, node)
    }
  }

  private debugNode (data? : string | EType[]) {
    if (!data) {
      return '[?]'
    }
    if (data instanceof Array) {
      return `[\`${data.map((it) => `${it}`).join(', ')}\`]`
    }
    return `\`${data}\``
  }
}
