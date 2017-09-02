export enum ENodeType {
  Program = 'Program',
  Directive = 'Directive',
  Macro = 'Macro',
  Text = 'Text',
  Interpolation = 'Interpolation',
}

export interface ISymbol {
  startToken : string
  endToken : string
  type : ENodeType
  end : boolean
}

export const symbols : ISymbol[] = [
  { startToken: '</#', endToken: '>', type: ENodeType.Directive, end: true },
  { startToken: '<#', endToken: '>', type: ENodeType.Directive, end: false },
  { startToken: '</@', endToken: '>', type: ENodeType.Macro, end: true },
  { startToken: '<@', endToken: '>', type: ENodeType.Macro, end: false },
  // tslint:disable-next-line:no-invalid-template-strings
  { startToken: '${', endToken: '}', type: ENodeType.Interpolation, end: false },
]

export const whitespaces : string[] = [
  ' ',
  '\t',
  '\n',
  '\r',
]

export function isWhitespace (char : string) : boolean {
  return char === ' ' || char === '\t' || char === '\r' || char === '\n'
}
