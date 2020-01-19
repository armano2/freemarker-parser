import { NodeType } from '../Symbols';
import { SourceLocation } from './SourceLocation';

export interface Location {
  start: number;
  end: number;
  loc?: {
    start: SourceLocation;
    end: SourceLocation;
  };
}

export interface Token extends Location {
  type: NodeType;
  startTag?: string;
  endTag?: string;
  params?: string;
  text: string;
}
