declare module 'line-column' {
  export interface ILineColumnType {
      line : number
      col : number
  }

  export interface ILineColumnOptions {
      origin? : number
  }

  export interface ItoIndexObject {
      line : number
      col? : number
      column? : number
  }

  export default interface ILineColumnFinder {
    (str : string, options? : ILineColumnOptions | number) : ILineColumnFinder
    new (str : string, options? : ILineColumnOptions | number)
    fromIndex (index : number) : ILineColumnType | null
    toIndex (line : number, column : number) : number | -1
    toIndex (options : number[] | ItoIndexObject) : number | -1
  }
}
