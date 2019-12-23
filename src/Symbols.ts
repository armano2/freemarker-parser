export enum ENodeType {
  Program = 'Program',
  OpenDirective = 'OpenDirective',
  CloseDirective = 'CloseDirective',
  OpenMacro = 'OpenMacro',
  CloseMacro = 'CloseMacro',
  Text = 'Text',
  Interpolation = 'Interpolation',
  Comment = 'Comment',
}

export interface ISymbol {
  startToken: string;
  endToken: string[];
  type: ENodeType;
}
