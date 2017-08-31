const freemarker = require('../index')
const fs = require('fs')
const path = require('path')

const parser = new freemarker.Parser()

const testsPath = path.join(__dirname, '../test/data/')

const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

for (const name of tests) {
  const dir = path.join(testsPath, name)
  let ast = {}
  const file = path.join(dir, 'template.ftl')
  const code = fs.readFileSync(file, 'utf8')
  ast = parser.parse(code)
  fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(parser.tokens, null, 2))
  fs.writeFileSync(path.join(dir, 'ast.json'), JSON.stringify(ast, null, 2))
}
