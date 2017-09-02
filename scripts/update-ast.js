const freemarker = require('../index')
const fs = require('fs')
const path = require('path')
const lineColumn = require('line-column')
const chalk = require('chalk')

const parser = new freemarker.Parser()

const testsPath = path.join(__dirname, '../test/data/')
const baseDir = path.join(__dirname, '..')

const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

let i = 0
for (const name of tests) {
  const fName = `[${++i}]`
  console.log(fName, 'Updating data for test', name)
  const dir = path.join(testsPath, name)
  const file = path.join(dir, 'template.ftl')
  const template = fs.readFileSync(file, 'utf8')
  try {
    console.log(fName, ' file:', path.relative(baseDir, file))
    const data = parser.parse(template)
    fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(data.tokens, null, 2))
    fs.writeFileSync(path.join(dir, 'ast.json'), JSON.stringify(data.ast, null, 2))
  } catch (e) {
    console.error(fName, chalk.red(e.message))
    if (e.nodeType) {
      const loc = lineColumn(template).fromIndex(e.start)
      console.error(fName, chalk.red(' file:', `${path.relative(baseDir, file)}:${loc ? `${loc.line}:${loc.col}` : '0:0'}`))
    }
  }
}
