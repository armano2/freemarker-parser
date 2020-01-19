import { NodeTypes } from '../enum/NodeTypes';
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
import ItemsNode from '../nodes/Items';

export interface NodeSelector {
  [n: string]: (token: Token, parent: AbstractNode) => AbstractNode;
}

const Nodes: NodeSelector = {
  [NodeTypes.Else](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof ConditionNode && !parent.alternate) {
      parent.alternate = [];
      return parent;
    } else if (parent instanceof ListNode && !parent.fallback) {
      parent.fallback = [];
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.Else}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.Condition](token: Token): ConditionNode {
    return new ConditionNode(token);
  },
  [NodeTypes.ConditionElse](token: Token, parent: AbstractNode): ConditionNode {
    if (parent instanceof ConditionNode && !parent.alternate) {
      parent.alternate = [];
      return new ConditionNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.ConditionElse}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.Recover](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof AttemptNode) {
      if (!parent.fallback) {
        parent.fallback = [];
        return parent;
      }
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.Recover}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.SwitchCase](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchCaseNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.SwitchCase}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.SwitchDefault](token: Token, parent: AbstractNode): AbstractNode {
    if (parent instanceof SwitchNode) {
      parent.cases.push(new SwitchDefaultNode(token));
      return parent;
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.SwitchDefault}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.Global](token: Token): GlobalNode {
    return new GlobalNode(token);
  },
  [NodeTypes.Local](token: Token): LocalNode {
    return new LocalNode(token);
  },
  [NodeTypes.Assign](token: Token): AssignNode {
    return new AssignNode(token);
  },
  [NodeTypes.Function](token: Token): FunctionNode {
    return new FunctionNode(token);
  },
  [NodeTypes.Return](token: Token): ReturnNode {
    return new ReturnNode(token);
  },
  [NodeTypes.Attempt](token: Token): AttemptNode {
    return new AttemptNode(token);
  },
  [NodeTypes.List](token: Token): ListNode {
    return new ListNode(token);
  },
  [NodeTypes.Macro](token: Token): MacroNode {
    return new MacroNode(token);
  },
  [NodeTypes.Include](token: Token): IncludeNode {
    return new IncludeNode(token);
  },
  [NodeTypes.Interpolation](token: Token): InterpolationNode {
    return new InterpolationNode(token);
  },
  [NodeTypes.Items](token: Token): ItemsNode {
    return new ItemsNode(token);
  },
  [NodeTypes.Text](token: Token): TextNode {
    return new TextNode(token);
  },
  [NodeTypes.MacroCall](token: Token): MacroCallNode {
    return new MacroCallNode(token);
  },
  [NodeTypes.Comment](token: Token): CommentNode {
    return new CommentNode(token);
  },
  [NodeTypes.Switch](token: Token): SwitchNode {
    return new SwitchNode(token);
  },
  [NodeTypes.Break](token: Token): BreakNode {
    return new BreakNode(token);
  },
  [NodeTypes.Compress](token: Token): CompressNode {
    return new CompressNode(token);
  },
  [NodeTypes.Import](token: Token): ImportNode {
    return new ImportNode(token);
  },
  [NodeTypes.Stop](token: Token): StopNode {
    return new StopNode(token);
  },
  [NodeTypes.Setting](token: Token): SettingNode {
    return new SettingNode(token);
  },
  [NodeTypes.Rt](token: Token): RtNode {
    return new RtNode(token);
  },
  [NodeTypes.Lt](token: Token): LtNode {
    return new LtNode(token);
  },
  [NodeTypes.Nt](token: Token): NtNode {
    return new NtNode(token);
  },
  [NodeTypes.T](token: Token): TNode {
    return new TNode(token);
  },
  [NodeTypes.Flush](token: Token): FlushNode {
    return new FlushNode(token);
  },
  [NodeTypes.Escape](token: Token): EscapeNode {
    return new EscapeNode(token);
  },
  [NodeTypes.NoEscape](token: Token, parent: AbstractNode): NoEscapeNode {
    if (parent instanceof EscapeNode || parent instanceof NoEscapeNode) {
      return new NoEscapeNode(token);
    }
    throw new ParseError(
      `Error while creating node '${NodeTypes.NoEscape}' inside '${parent.type}'`,
      token,
    );
  },
  [NodeTypes.Ftl](token: Token): FtlNode {
    return new FtlNode(token);
  },
  [NodeTypes.AutoEsc](token: Token): AutoEscNode {
    return new AutoEscNode(token);
  },
  [NodeTypes.NoAutoEsc](token: Token): NoAutoEscNode {
    return new NoAutoEscNode(token);
  },
  [NodeTypes.OutputFormat](token: Token): OutputFormatNode {
    return new OutputFormatNode(token);
  },
};

export default Nodes;
