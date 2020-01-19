import { SourceLocation } from '../interface/SourceLocation';
import { Location } from '../interface/Tokens';

export default class ParseError implements Location {
  public message: string;
  public start: number;
  public end: number;
  public loc?: {
    start: SourceLocation;
    end: SourceLocation;
  };

  constructor(message: string, el: Location) {
    this.message = message;
    this.start = el.start;
    this.end = el.end;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}
