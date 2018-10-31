import NodeNames from './NodeNames'

export enum Directives {
  if = NodeNames.Condition,
  else = NodeNames.Else,
  elseif = NodeNames.ConditionElse,
  list = NodeNames.List,
  include = NodeNames.Include,
  assign = NodeNames.Assign,
  attempt = NodeNames.Attempt,
  compress = NodeNames.Compress,
  escape = NodeNames.Escape,
  noescape = NodeNames.NoEscape,
  // fallback = NodeNames.Fallback, // TODO: unsupported
  function = NodeNames.Function,
  flush = NodeNames.Flush,
  global = NodeNames.Global,
  import = NodeNames.Import,
  local = NodeNames.Local,
  lt = NodeNames.Lt,
  macro = NodeNames.Macro,
  // nested = NodeNames.Nested, // TODO: unsupported
  nt = NodeNames.Nt,
  recover = NodeNames.Recover,
  // recurse = NodeNames.Recurse, // TODO: unsupported
  return = NodeNames.Return,
  rt = NodeNames.Rt,
  setting = NodeNames.Setting,
  stop = NodeNames.Stop,
  switch = NodeNames.Switch,
  case = NodeNames.SwitchCase,
  default = NodeNames.SwitchDefault,
  break = NodeNames.Break,
  t = NodeNames.T,
  // visit = NodeNames.Visit, // TODO: unsupported
  noparse = NodeNames.Text,
}
