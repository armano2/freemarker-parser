const freemarker = require('../dist/index')
const fs = require('fs')
const path = require('path')
const stringify = require('./stringify')

const parser = new freemarker.Parser()

const baseDir = path.join(__dirname, '..')

let i = 0

function updateData (testsPath) {
  const tests = fs.readdirSync(testsPath)
    .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

  for (const name of tests) {
    const fName = `[${++i}]`
    console.log(fName, 'Updating data for test', name)
    const dir = path.join(testsPath, name)
    const file = path.join(dir, 'template.ftl')
    const template = fs.readFileSync(file, 'utf8')
    console.log(fName, ' file:', path.relative(baseDir, file))
    const data = parser.parse(template)
    fs.writeFileSync(path.join(dir, 'tokens.json'), stringify(data.tokens))
    fs.writeFileSync(path.join(dir, 'ast.json'), stringify(data.ast))
  }
}

updateData(path.join(baseDir, 'test/resource/valid/'))
updateData(path.join(baseDir, 'test/resource/invalid/'))
