const freemarker = require('../dist/index')
const fs = require('fs')
const path = require('path')
const { default: LinesAndColumns } = require('lines-and-columns')
const chalk = require('chalk')

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
    try {
      console.log(fName, ' file:', path.relative(baseDir, file))
      const data = parser.parse(template)
      fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(data.tokens, null, 2))
      fs.writeFileSync(path.join(dir, 'ast.json'), JSON.stringify(data.ast, null, 2))
    } catch (e) {
      console.error(fName, chalk.red(e.message))
      if (e.start) {
        const line = new LinesAndColumns(template)
        const loc = line.locationForIndex(e.start) || undefined
        console.error(fName, chalk.red(' file:', `${path.relative(baseDir, file)}:${loc ? `${loc.line}:${loc.col}` : '0:0'}`))
      }
    }
  }
}

function updateTokens (testsPath) {
  const tests = fs.readdirSync(testsPath)
    .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

  for (const name of tests) {
    const fName = `[${++i}]`
    console.log(fName, 'Updating data for test', name)
    const dir = path.join(testsPath, name)
    const file = path.join(dir, 'template.ftl')
    const template = fs.readFileSync(file, 'utf8')
    try {
      console.log(fName, ' file:', path.relative(baseDir, file))
      parser.parse(template)
    } catch (e) {
      const errors = { message: e.message }
      if ('start' in e || 'end' in e) {
        const line = new LinesAndColumns(template)
        errors.start = line.locationForIndex(e.start) || undefined
        errors.end = line.locationForIndex(e.end) || undefined
      }
      fs.writeFileSync(path.join(dir, 'error.json'), JSON.stringify(errors, null, 2))
    }
  }
}

updateData(path.join(baseDir, 'test/resource/valid/'))
updateTokens(path.join(baseDir, 'test/resource/invalid/'))
