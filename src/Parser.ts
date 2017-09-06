import NodeError from './errors/NodeError'

import { Tokenizer } from './Tokenizer'
import { IToken } from './types/Tokens'

import { AllNodeTypes, IProgram } from './types/Node'
import { cProgram } from './utils/Node'
import { addNodeChild, canAddChildren, isPartial, tokenToNodeType } from './utils/Token'

export interface IParserReturn {
  ast : IProgram
  tokens : IToken[]
}

export class Parser {
  public parse (template : string) : IParserReturn {
    const ast = cProgram(0, template.length)
    const stack : AllNodeTypes[] = []
    let parent : AllNodeTypes = ast

    const tokenizer = new Tokenizer()
    const tokens = tokenizer.parse(template)
    if (tokens.length === 0) {
      return { ast, tokens }
    }

    let token : IToken | null = null
    for (token of tokens) {
      const tokenType = tokenToNodeType(token)

      if (token.isClose) {
        if (parent.type !== tokenType) {
          throw new NodeError(`Unexpected close tag '${token.type}'`, token)
        }
        parent = stack.pop() as AllNodeTypes // its always
      } else {
        const node = addNodeChild(parent, token)
        if (node !== parent && canAddChildren(node)) {
          if (!isPartial(tokenType, parent.type)) {
            stack.push(parent)
          }
          parent = node
        }
      }
    }

    if (stack.length > 0) {
      const el = stack.pop() as AllNodeTypes
      throw new NodeError(`Unclosed tag '${el.type}'`, el)
    }
    return { ast, tokens }
  }
}
