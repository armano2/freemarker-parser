const freemarker = require('../index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')

const parser = new freemarker.Parser()

const testsPath = path.join(__dirname, '/data/')
const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

for (const name of tests) {
  describe(name, function () {
    it('should have no errors', function () {
      const dir = path.join(testsPath, name)
      try {
        const file = path.join(dir, 'template.ftl')
        const code = fs.readFileSync(file, 'utf8')
        const ast = parser.parse(code, file)

        fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(parser.tokens, null, 2))
        fs.writeFileSync(path.join(dir, 'ast.json'), JSON.stringify(ast, null, 2))
      } catch (e) {
        assert.fail(e.message)
      }
    })
  })
}
