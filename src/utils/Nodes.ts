import NodeNames from '../enum/NodeNames';
import ParseError from '../errors/ParseError';
import { Token } from '../interface/Tokens';

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

export interface NodeSelector {
  [n: string]: (token: Token, parent: AbstractNode) => AbstractNode;
}

const Nodes: NodeSelector = {
  [NodeNames.Else](token: Token, parent: AbstractNode): AbstractNode {
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
  [NodeNames.Condition](token: Token): ConditionNode {
    return new ConditionNode(token);
  },
  [NodeNames.ConditionElse](token: Token, parent: AbstractNode): ConditionNode {
    if (parent instanceof ConditionNode && !parent.alternate) {
      parent.alternate = [];
      return new ConditionNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.ConditionElse}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Recover](token: Token, parent: AbstractNode): AbstractNode {
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
  [NodeNames.SwitchCase](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchCaseNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.SwitchCase}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.SwitchDefault](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchDefaultNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.SwitchDefault}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Global](token: Token): GlobalNode {
    return new GlobalNode(token);
  },
  [NodeNames.Local](token: Token): LocalNode {
    return new LocalNode(token);
  },
  [NodeNames.Assign](token: Token): AssignNode {
    return new AssignNode(token);
  },
  [NodeNames.Function](token: Token): FunctionNode {
    return new FunctionNode(token);
  },
  [NodeNames.Return](token: Token): ReturnNode {
    return new ReturnNode(token);
  },
  [NodeNames.Attempt](token: Token): AttemptNode {
    return new AttemptNode(token);
  },
  [NodeNames.List](token: Token): ListNode {
    return new ListNode(token);
  },
  [NodeNames.Macro](token: Token): MacroNode {
    return new MacroNode(token);
  },
  [NodeNames.Include](token: Token): IncludeNode {
    return new IncludeNode(token);
  },
  [NodeNames.Interpolation](token: Token): InterpolationNode {
    return new InterpolationNode(token);
  },
  [NodeNames.Text](token: Token): TextNode {
    return new TextNode(token);
  },
  [NodeNames.MacroCall](token: Token): MacroCallNode {
    return new MacroCallNode(token);
  },
  [NodeNames.Comment](token: Token): CommentNode {
    return new CommentNode(token);
  },
  [NodeNames.Switch](token: Token): SwitchNode {
    return new SwitchNode(token);
  },
  [NodeNames.Break](token: Token): BreakNode {
    return new BreakNode(token);
  },
  [NodeNames.Compress](token: Token): CompressNode {
    return new CompressNode(token);
  },
  [NodeNames.Import](token: Token): ImportNode {
    return new ImportNode(token);
  },
  [NodeNames.Stop](token: Token): StopNode {
    return new StopNode(token);
  },
  [NodeNames.Setting](token: Token): SettingNode {
    return new SettingNode(token);
  },
  [NodeNames.Rt](token: Token): RtNode {
    return new RtNode(token);
  },
  [NodeNames.Lt](token: Token): LtNode {
    return new LtNode(token);
  },
  [NodeNames.Nt](token: Token): NtNode {
    return new NtNode(token);
  },
  [NodeNames.T](token: Token): TNode {
    return new TNode(token);
  },
  [NodeNames.Flush](token: Token): FlushNode {
    return new FlushNode(token);
  },
  [NodeNames.Escape](token: Token): EscapeNode {
    return new EscapeNode(token);
  },
  [NodeNames.NoEscape](token: Token, parent: AbstractNode): NoEscapeNode {
    if (parent instanceof EscapeNode || parent instanceof NoEscapeNode) {
      return new NoEscapeNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeNames.NoEscape}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeNames.Ftl](token: Token): FtlNode {
    return new FtlNode(token);
  },
  [NodeNames.AutoEsc](token: Token): AutoEscNode {
    return new AutoEscNode(token);
  },
  [NodeNames.NoAutoEsc](token: Token): NoAutoEscNode {
    return new NoAutoEscNode(token);
  },
  [NodeNames.OutputFormat](token: Token): OutputFormatNode {
    return new OutputFormatNode(token);
  },
};

export default Nodes;
