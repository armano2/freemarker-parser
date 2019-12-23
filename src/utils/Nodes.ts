import NodeNames from '../enum/NodeNames';
import ParseError from '../errors/ParseError';
import { IToken } from '../interface/Tokens';

import AbstractNode from '../nodes/abstract/AbstractNode';
import AssignNode from '../nodes/AssignNode';
import AttemptNode from '../nodes/AttemptNode';
import AutoEscNode from '../nodes/AutoEscNode';
import BreakNode from '../nodes/BreakNode';
import CommentNode from '../nodes/CommentNode';
import CompressNode from '../nodes/CompressNode';
import ConditionNode from '../nodes/ConditionNode';
import EscapeNode from '../nodes/EscapeNode';
import FlushNode from '../nodes/FlushNode';
import FtlNode from '../nodes/FtlNode';
import FunctionNode from '../nodes/FunctionNode';
import GlobalNode from '../nodes/GlobalNode';
import ImportNode from '../nodes/ImportNode';
import IncludeNode from '../nodes/IncludeNode';
import InterpolationNode from '../nodes/InterpolationNode';
import ListNode from '../nodes/ListNode';
import LocalNode from '../nodes/LocalNode';
import LtNode from '../nodes/LtNode';
import MacroCallNode from '../nodes/MacroCallNode';
import MacroNode from '../nodes/MacroNode';
import NoAutoEscNode from '../nodes/NoAutoEscNode';
import NoEscapeNode from '../nodes/NoEscapeNode';
import NtNode from '../nodes/NtNode';
import OutputFormatNode from '../nodes/OutputFormatNode';
import ReturnNode from '../nodes/ReturnNode';
import RtNode from '../nodes/RtNode';
import SettingNode from '../nodes/SettingNode';
import StopNode from '../nodes/StopNode';
import SwitchCaseNode from '../nodes/SwitchCaseNode';
import SwitchDefaultNode from '../nodes/SwitchDefaultNode';
import SwitchNode from '../nodes/SwitchNode';
import TextNode from '../nodes/TextNode';
import TNode from '../nodes/TNode';

export interface INodes {
  [n: string]: (token: IToken, parent: AbstractNode) => AbstractNode;
}

const Nodes: INodes = {
  [NodeNames.Else](token: IToken, parent: AbstractNode): AbstractNode {
    if (parent instanceof ConditionNode && !parent.alternate) {
      parent.alternate = [];
      return parent;
    } else if (parent instanceof ListNode && !parent.fallback) {
      parent.fallback = [];
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.Else}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Condition](token: IToken): ConditionNode {
    return new ConditionNode(token);
  },
  [NodeNames.ConditionElse](
    token: IToken,
    parent: AbstractNode,
  ): ConditionNode {
    if (parent instanceof ConditionNode && !parent.alternate) {
      parent.alternate = [];
      return new ConditionNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.ConditionElse}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Recover](token: IToken, parent: AbstractNode): AbstractNode {
    if (parent instanceof AttemptNode) {
      if (!parent.fallback) {
        parent.fallback = [];
        return parent;
      }
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.Recover}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.SwitchCase](token: IToken, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchCaseNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.SwitchCase}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.SwitchDefault](token: IToken, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchDefaultNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.SwitchDefault}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Global](token: IToken): GlobalNode {
    return new GlobalNode(token);
  },
  [NodeNames.Local](token: IToken): LocalNode {
    return new LocalNode(token);
  },
  [NodeNames.Assign](token: IToken): AssignNode {
    return new AssignNode(token);
  },
  [NodeNames.Function](token: IToken): FunctionNode {
    return new FunctionNode(token);
  },
  [NodeNames.Return](token: IToken): ReturnNode {
    return new ReturnNode(token);
  },
  [NodeNames.Attempt](token: IToken): AttemptNode {
    return new AttemptNode(token);
  },
  [NodeNames.List](token: IToken): ListNode {
    return new ListNode(token);
  },
  [NodeNames.Macro](token: IToken): MacroNode {
    return new MacroNode(token);
  },
  [NodeNames.Include](token: IToken): IncludeNode {
    return new IncludeNode(token);
  },
  [NodeNames.Interpolation](token: IToken): InterpolationNode {
    return new InterpolationNode(token);
  },
  [NodeNames.Text](token: IToken): TextNode {
    return new TextNode(token);
  },
  [NodeNames.MacroCall](token: IToken): MacroCallNode {
    return new MacroCallNode(token);
  },
  [NodeNames.Comment](token: IToken): CommentNode {
    return new CommentNode(token);
  },
  [NodeNames.Switch](token: IToken): SwitchNode {
    return new SwitchNode(token);
  },
  [NodeNames.Break](token: IToken): BreakNode {
    return new BreakNode(token);
  },
  [NodeNames.Compress](token: IToken): CompressNode {
    return new CompressNode(token);
  },
  [NodeNames.Import](token: IToken): ImportNode {
    return new ImportNode(token);
  },
  [NodeNames.Stop](token: IToken): StopNode {
    return new StopNode(token);
  },
  [NodeNames.Setting](token: IToken): SettingNode {
    return new SettingNode(token);
  },
  [NodeNames.Rt](token: IToken): RtNode {
    return new RtNode(token);
  },
  [NodeNames.Lt](token: IToken): LtNode {
    return new LtNode(token);
  },
  [NodeNames.Nt](token: IToken): NtNode {
    return new NtNode(token);
  },
  [NodeNames.T](token: IToken): TNode {
    return new TNode(token);
  },
  [NodeNames.Flush](token: IToken): FlushNode {
    return new FlushNode(token);
  },
  [NodeNames.Escape](token: IToken): EscapeNode {
    return new EscapeNode(token);
  },
  [NodeNames.NoEscape](token: IToken, parent: AbstractNode): NoEscapeNode {
    if (parent instanceof EscapeNode || parent instanceof NoEscapeNode) {
      return new NoEscapeNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.NoEscape}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Ftl](token: IToken): FtlNode {
    return new FtlNode(token);
  },
  [NodeNames.AutoEsc](token: IToken): AutoEscNode {
    return new AutoEscNode(token);
  },
  [NodeNames.NoAutoEsc](token: IToken): NoAutoEscNode {
    return new NoAutoEscNode(token);
  },
  [NodeNames.OutputFormat](token: IToken): OutputFormatNode {
    return new OutputFormatNode(token);
  },
};

export default Nodes;
