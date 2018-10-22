declare module 'tiny-glob' {
  interface IOptions {
    cwd? : string
    dot? : boolean
    absolute? : boolean
    filesOnly? : boolean
    flush? : boolean
  }

  type FilePath = string

  function glob (str : string, opts? : IOptions) : Promise<FilePath[]>

  export = glob
}
