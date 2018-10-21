import NodeNames from '../enum/NodeNames'
import NodeError from '../errors/NodeError'
import AbstractNode from '../types/Nodes/AbstractNode'
import IAssign from '../types/Nodes/IAssign'
import IAttempt from '../types/Nodes/IAttempt'
import IBreak from '../types/Nodes/IBreak'
import IComment from '../types/Nodes/IComment'
import ICompress from '../types/Nodes/ICompress'
import ICondition from '../types/Nodes/ICondition'
import IFunction from '../types/Nodes/IFunction'
import IGlobal from '../types/Nodes/IGlobal'
import IImport from '../types/Nodes/IImport'
import IInclude from '../types/Nodes/IInclude'
import IInterpolation from '../types/Nodes/IInterpolation'
import IList from '../types/Nodes/IList'
import ILocal from '../types/Nodes/ILocal'
import IMacro from '../types/Nodes/IMacro'
import IMacroCall from '../types/Nodes/IMacroCall'
import IReturn from '../types/Nodes/IReturn'
import IStop from '../types/Nodes/IStop'
import ISwitch from '../types/Nodes/ISwitch'
import ISwitchCase from '../types/Nodes/ISwitchCase'
import ISwitchDefault from '../types/Nodes/ISwitchDefault'
import IText from '../types/Nodes/IText'
import { IToken } from '../types/Tokens'

export interface INodes {
  [n : string] : (token : IToken, parent : AbstractNode) => AbstractNode
}

const Nodes : INodes = {
  [NodeNames.Else] (token : IToken, parent : AbstractNode) : AbstractNode {
    if (parent instanceof ICondition && !parent.alternate) {
      parent.alternate = []
      return parent
    } else if (parent instanceof IList && !parent.fallback) {
      parent.fallback = []
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.Else}' inside '${parent.type}'`, token)
  },
  [NodeNames.Condition] (token : IToken) : ICondition {
    return new ICondition(token)
  },
  [NodeNames.ConditionElse] (token : IToken, parent : AbstractNode) : ICondition {
    if (parent instanceof ICondition && !parent.alternate) {
      parent.alternate = []
      return new ICondition(token)
    }
    throw new NodeError(`Error while creating node '${NodeNames.ConditionElse}' inside '${parent.type}'`, token)
  },
  [NodeNames.Recover] (token : IToken, parent : AbstractNode) : AbstractNode {
    if (parent instanceof IAttempt) {
      if (!parent.fallback) {
        parent.fallback = []
        return parent
      }
    }
    throw new NodeError(`Error while creating node '${NodeNames.Recover}' inside '${parent.type}'`, token)
  },
  [NodeNames.SwitchCase] (token : IToken, parent : AbstractNode) : AbstractNode {
    if (parent instanceof ISwitch) {
      parent.cases.push(new ISwitchCase(token))
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.SwitchCase}' inside '${parent.type}'`, token)
  },
  [NodeNames.SwitchDefault] (token : IToken, parent : AbstractNode) : AbstractNode {
    if (parent instanceof ISwitch) {
      parent.cases.push(new ISwitchDefault(token))
      return parent
    }
    throw new NodeError(`Error while creating node '${NodeNames.SwitchDefault}' inside '${parent.type}'`, token)
  },
  [NodeNames.Global] (token : IToken) : IGlobal {
    return new IGlobal(token)
  },
  [NodeNames.Local] (token : IToken) : ILocal {
    return new ILocal(token)
  },
  [NodeNames.Assign] (token : IToken) : IAssign {
    return new IAssign(token)
  },
  [NodeNames.Function] (token : IToken) : IFunction {
    return new IFunction(token)
  },
  [NodeNames.Return] (token : IToken) : IReturn {
    return new IReturn(token)
  },
  [NodeNames.Attempt] (token : IToken) : IAttempt {
    return new IAttempt(token)
  },
  [NodeNames.List] (token : IToken) : IList {
    return new IList(token)
  },
  [NodeNames.Macro] (token : IToken) : IMacro {
    return new IMacro(token)
  },
  [NodeNames.Include] (token : IToken) : IInclude {
    return new IInclude(token)
  },
  [NodeNames.Interpolation] (token : IToken) : IInterpolation {
    return new IInterpolation(token)
  },
  [NodeNames.Text] (token : IToken) : IText {
    return new IText(token)
  },
  [NodeNames.MacroCall] (token : IToken) : IMacroCall {
    return new IMacroCall(token)
  },
  [NodeNames.Comment] (token : IToken) : IComment {
    return new IComment(token)
  },
  [NodeNames.Switch] (token : IToken) : ISwitch {
    return new ISwitch(token)
  },
  [NodeNames.Break] (token : IToken) : IBreak {
    return new IBreak(token)
  },
  [NodeNames.Compress] (token : IToken) : ICompress {
    return new ICompress(token)
  },
  [NodeNames.Import] (token : IToken) : IImport {
    return new IImport(token)
  },
  [NodeNames.Stop] (token : IToken) : IStop {
    return new IStop(token)
  },
}

export default Nodes
