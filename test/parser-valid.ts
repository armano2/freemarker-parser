import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { Parser } from '../src/index'

const parser = new Parser()

const baseDir = path.join(__dirname, '..')
const testsPath = path.join(__dirname, '/resource/valid/')
const tests = fs.readdirSync(testsPath)
  .filter((f) => fs.statSync(path.join(testsPath, f)).isDirectory())

for (const name of tests) {
  describe(name, () => {
    const dir = path.join(testsPath, name)
    const file = path.join(dir, 'template.ftl')
    const template = fs.readFileSync(file, 'utf8')
    const data = parser.parse(template)

    it('should have no errors', () => {
      if (data.ast.errors) {
        for (const error of data.ast.errors) {
          assert.fail(`${error.message}\n\tfile:.\\${path.relative(baseDir, file)}:${error.start ? `${error.start.line}:${error.start.column}` : '0:0'}`)
        }
      }
    })

    it('should have correct tokens', () => {
      const code = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'))
      assert.deepEqual(data.tokens, code, 'tokens do match')
    })

    it('should have correct ast', () => {
      const code = JSON.parse(fs.readFileSync(path.join(dir, 'ast.json'), 'utf8'))
      assert.deepEqual(data.ast, code, 'tokens do match')
    })
  })
}
