interface LineColumnType {
  line : number
  col : number
}
interface LineColumnOptions {
  origin : number
}

declare class line_column {
  constructor(str: string, options: LineColumnOptions);

  fromIndex(index: number): LineColumnType | null;
  toIndex(line: number, column: number): number | -1;
}

declare function lineColumn(name: string): line_column;

declare module 'line-column' {
  export default lineColumn
}
