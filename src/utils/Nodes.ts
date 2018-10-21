import NodeNames from '../enum/NodeNames'
import NodeError from '../errors/NodeError'
import { AllNodeTypes } from '../types/Node'
import { IToken } from '../types/Tokens'
import {
  cAssign,
  cAttempt,
  cBreak,
  cComment,
  cCompress,
  cCondition,
  cFunction,
  cGlobal,
  cImport,
  cInclude,
  cInterpolation,
  cList,
  cLocal,
  cMacro,
  cMacroCall,
  cReturn,
  cStop,
  cSwitch,
  cSwitchCase,
  cSwitchDefault,
  cText,
} from './Node'

export interface INodes {
  [n : string] : (token : IToken, parent : AllNodeTypes) => AllNodeTypes
}

const Nodes : INodes = {
  [NodeNames.Else] (token : IToken, parent : AllNodeTypes) : AllNodeTypes {
    if (parent.type === NodeNames.Condition && !parent.alternate) {
      parent.alternate = []
      return parent
    } else if (parent.type === NodeNames.List && !parent.fallback) {
      parent.fallback = []
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.Else}' inside '${parent.type}'`, token)
  },
  [NodeNames.Condition] (token : IToken) : AllNodeTypes {
    return cCondition(token.start, token.end, token.params)
  },
  [NodeNames.ConditionElse] (token : IToken, parent : AllNodeTypes) : AllNodeTypes {
    if (parent.type === NodeNames.Condition && !parent.alternate) {
      parent.alternate = []
      return cCondition(token.start, token.end, token.params)
    }
    throw new NodeError(`Error while creating node '${NodeNames.ConditionElse}' inside '${parent.type}'`, token)
  },
  [NodeNames.Recover] (token : IToken, parent : AllNodeTypes) : AllNodeTypes {
    if (parent.type === NodeNames.Attempt) {
      if (!parent.fallback) {
        parent.fallback = []
        return parent
      }
    }
    throw new NodeError(`Error while creating node '${NodeNames.Recover}' inside '${parent.type}'`, token)
  },
  [NodeNames.SwitchCase] (token : IToken, parent : AllNodeTypes) : AllNodeTypes {
    if (parent.type === NodeNames.Switch) {
      parent.cases.push(cSwitchCase(token.start, token.end, token.params))
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.SwitchCase}' inside '${parent.type}'`, token)
  },
  [NodeNames.SwitchDefault] (token : IToken, parent : AllNodeTypes) : AllNodeTypes {
    if (parent.type === NodeNames.Switch) {
      parent.cases.push(cSwitchDefault(token.start, token.end))
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.SwitchDefault}' inside '${parent.type}'`, token)
  },
  [NodeNames.Global] (token : IToken) : AllNodeTypes {
    return cGlobal(token.start, token.end, token.params)
  },
  [NodeNames.Local] (token : IToken) : AllNodeTypes {
    return cLocal(token.start, token.end, token.params)
  },
  [NodeNames.Assign] (token : IToken) : AllNodeTypes {
    return cAssign(token.start, token.end, token.params)
  },
  [NodeNames.Function] (token : IToken) : AllNodeTypes {
    return cFunction(token.start, token.end, token.params)
  },
  [NodeNames.Return] (token : IToken) : AllNodeTypes {
    return cReturn(token.start, token.end, token.params)
  },
  [NodeNames.Attempt] (token : IToken) : AllNodeTypes {
    return cAttempt(token.start, token.end)
  },
  [NodeNames.List] (token : IToken) : AllNodeTypes {
    return cList(token.start, token.end, token.params)
  },
  [NodeNames.Macro] (token : IToken) : AllNodeTypes {
    return cMacro(token.start, token.end, token.params)
  },
  [NodeNames.Include] (token : IToken) : AllNodeTypes {
    return cInclude(token.start, token.end, token.params)
  },
  [NodeNames.Interpolation] (token : IToken) : AllNodeTypes {
    return cInterpolation(token.start, token.end, token.params)
  },
  [NodeNames.Text] (token : IToken) : AllNodeTypes {
    return cText(token.text, token.start, token.end)
  },
  [NodeNames.MacroCall] (token : IToken) : AllNodeTypes {
    return cMacroCall(token.text, token.start, token.end, token.endTag, token.params)
  },
  [NodeNames.Comment] (token : IToken) : AllNodeTypes {
    return cComment(token.text, token.start, token.end)
  },
  [NodeNames.Switch] (token : IToken) : AllNodeTypes {
    return cSwitch(token.start, token.end, token.params)
  },
  [NodeNames.Break] (token : IToken) : AllNodeTypes {
    return cBreak(token.start, token.end)
  },
  [NodeNames.Compress] (token : IToken) : AllNodeTypes {
    return cCompress(token.start, token.end)
  },
  [NodeNames.Import] (token : IToken) : AllNodeTypes {
    return cImport(token.start, token.end, token.params)
  },
  [NodeNames.Stop] (token : IToken) : AllNodeTypes {
    return cStop(token.start, token.end, token.params)
  },
}

export default Nodes
