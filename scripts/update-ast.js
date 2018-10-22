const freemarker = require('../dist/index')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

const parser = new freemarker.Parser()

const testsPath = path.join(__dirname, '..', 'test', 'resource')

function stringify (text) {
  return JSON.stringify(text, null, 2)
}

glob('./**/*.ftl', { cwd: testsPath, nodir: true, absolute: true }, (e, files) => {
  if (e) {
    throw e
  }
  for (const file of files) {
    fs.readFile(file, 'utf8', (err, template) => {
      if (err) {
        throw new Error(err)
      }
      const dirname = path.dirname(file)
      const basename = path.basename(file).replace(path.extname(file), '')

      console.log(`Updating data ${basename}`)
      console.log(' file:', path.relative(testsPath, file))

      const data = parser.parse(template)
      fs.writeFileSync(path.join(dirname, `${basename}-tokens.json`), stringify(data.tokens, null, 2))
      fs.writeFileSync(path.join(dirname, `${basename}-ast.json`), stringify(data.ast, null, 2))
    })
  }
})
