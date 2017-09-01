import NodeError from './errors/NodeError'
import ParserError from './errors/ParserError'

import Tokenizer from './Tokenizer'

import { AllNodeTypes, IProgram } from './nodes/Types'
import { cProgram } from './utils/Node'
import { addNodeChild, isSelfClosing, tokenToNodeType } from './utils/Token'

export class Parser {
  public parse (template : string) : IProgram {
    const astRoot = cProgram(0, template.length)
    const stack : AllNodeTypes[] = []
    let parent : AllNodeTypes = astRoot

    const tokenizer = new Tokenizer()
    const tokens = tokenizer.parse(template)

    for (const token of tokens) {
      const tokenType = tokenToNodeType(token)

      if (isSelfClosing(tokenType)) {
        if (token.isClose) {
          throw new NodeError(`Unexpected close tag`, token)
        }
        addNodeChild(parent, token)
      } else if (token.isClose) {
        let parentNode : AllNodeTypes | undefined = parent
        while (parentNode) {
          if (parentNode.type === tokenType) {
            parentNode = stack.pop()
            break
          }
          if (!isSelfClosing(parentNode.type)) {
            throw new NodeError(`Missing close tag ${tokenType}`, parentNode)
          }
          parentNode = stack.pop()
        }

        if (!parentNode) {
          throw new NodeError(`Unexpected close tag`, token)
        }
        parent = parentNode

      } else {
        // parent = parent.addChild(node)
        // stack.push(parent)
        // parent = node
        stack.push(parent)
        parent = addNodeChild(parent, token)
      }
    }

    if (stack.length > 0) {
      throw new ParserError(`Unclosed tag`)
    }
    return astRoot
  }
}
