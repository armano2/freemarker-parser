import { EType } from './Types'

export interface INodeConfig {
  isSelfClosing : boolean
  onlyIn? : EType[]
}

export interface INodeConfigObj {
  [c : string] : INodeConfig
}

export const NodeConfig : INodeConfigObj = {
  [EType.Program]: {
    isSelfClosing: false,
  },
  [EType.Text]: {
    isSelfClosing: true,
  },
  [EType.MacroCall]: {
    isSelfClosing: true,
  },
  [EType.Interpolation]: {
    isSelfClosing: true,
  },

  // Build in macro
  [EType.include]: {
    isSelfClosing: true,
  },
  [EType.assign]: {
    isSelfClosing: true,
  },
  [EType.if]: {
    isSelfClosing: false,
  },
  [EType.else]: {
    isSelfClosing: true,
    onlyIn: [EType.if, EType.elseif, EType.list],
  },
  [EType.elseif]: {
    isSelfClosing: true,
    onlyIn: [EType.if],
  },
  [EType.list]: {
    isSelfClosing: false,
  },
  [EType.attempt]: {
    isSelfClosing: false,
  },
  [EType.recurse]: {
    isSelfClosing: true,
  },
  [EType.compress]: {
    isSelfClosing: false,
  },
  [EType.escape]: {
    isSelfClosing: false,
  },
  [EType.noescape]: {
    isSelfClosing: false,
  },
  [EType.fallback]: {
    isSelfClosing: true,
  },
  [EType.function]: {
    isSelfClosing: false,
  },
  [EType.flush]: {
    isSelfClosing: true,
  },
  [EType.global]: {
    isSelfClosing: true,
  },
  [EType.import]: {
    isSelfClosing: true,
  },
  [EType.local]: {
    isSelfClosing: true,
  },
  [EType.lt]: {
    isSelfClosing: true,
  },
  [EType.macro]: {
    isSelfClosing: false,
  },
  [EType.nested]: {
    isSelfClosing: true,
  },
  [EType.nt]: {
    isSelfClosing: true,
  },
  [EType.recover]: {
    isSelfClosing: true,
  },
  [EType.return]: {
    isSelfClosing: true,
  },
  [EType.rt]: {
    isSelfClosing: true,
  },
  [EType.setting]: {
    isSelfClosing: true,
  },
  [EType.stop]: {
    isSelfClosing: true,
  },
  [EType.switch]: {
    isSelfClosing: true,
  },
  [EType.case]: {
    isSelfClosing: true,
  },
  [EType.break]: {
    isSelfClosing: true,
  },
  [EType.t]: {
    isSelfClosing: true,
  },
  [EType.visit]: {
    isSelfClosing: true,
  },
}
