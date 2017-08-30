// TODO: create specific classes/objects for each of this types with additional fields required for them
export enum ETypeSymbol {
  None,
  Directive,
  Macro,
  Print,
}

// TODO: change this to object with configuration
// - allowParams
// - allowChildrens
// - sub elements
export enum EType {
  Program = '@program',
  Text = '@text',
  MacroCall = '@macro',
  // Build in macro
  if = 'if',
    else = 'else',
    elseif = 'elseif',
  list = 'list',
  include = 'include',
  assign = 'assign',
  attempt = 'attempt',
  compress = 'compress',
  escape = 'escape',
    noescape = 'noescape',
  fallback = 'fallback',
  function = 'function',
  flush = 'flush',
  global = 'global',
  import = 'import',
  local = 'local',
  lt = 'lt',
  macro = 'macro',
  nested = 'nested',
  nt = 'nt',
  recover = 'recover',
  recurse = 'recurse',
  return = 'return',
  rt = 'rt',
  setting = 'setting',
  stop = 'stop',
  switch = 'switch',
    // else = 'else',
    case = 'case',
    break = 'break',
  t = 't',
  visit = 'visit',
}
