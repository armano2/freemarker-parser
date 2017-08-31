const freemarker = require('../index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const lineColumn = require('line-column')

const parser = new freemarker.Parser()

const baseDir = path.join(__dirname, '..')
const testsPath = path.join(__dirname, '/data/')
const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

// function describe (name, cb) {
//   console.log(name)
//   cb()
// }
// function it (name, cb) {
//   console.log(name)
//   cb()
// }

for (const name of tests) {
  describe(name, function () {
    it('should have no errors', function () {
      const dir = path.join(testsPath, name)
      let ast = {}
      try {
        const file = path.join(dir, 'template.ftl')
        const code = fs.readFileSync(file, 'utf8')
        ast = parser.parse(code)
      } catch (e) {
        let message = e.message
        if (e.node) {
          const loc = lineColumn(parser.template).fromIndex(e.node.start)
          message += `\n\tfile:.\\${path.relative(baseDir, parser.filename)}:${loc ? `${loc.line}:${loc.col}` : '0:0'}`
        }
        assert.fail(message)
      }
      try {
        fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(parser.tokens, null, 2))
        fs.writeFileSync(path.join(dir, 'ast.json'), JSON.stringify(ast, null, 2))
      } catch (e) {
        assert.fail(e.message)
      }
    })
  })
}
