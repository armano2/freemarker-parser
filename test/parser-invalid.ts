import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import { Parser } from '../src/index'

const parser = new Parser()

const testsPath = path.join(__dirname, '/resource/invalid/')
const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

function stringify (text : any) {
  return JSON.stringify(text, null, 2)
}

for (const name of tests) {
  describe(name, function () {
    const dir = path.join(testsPath, name)
    const file = path.join(dir, 'template.ftl')
    const template = fs.readFileSync(file, 'utf8')
    const data = parser.parse(template)

    it('should have errors', function () {
      if (!data.ast.errors) {
        assert.fail('This test should have an error')
      }
    })

    it('should have correct tokens', function () {
      const code = fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8')
      assert.equal(stringify(data.tokens), code, 'tokens do match')
    })

    it('should have correct ast', function () {
      const code = fs.readFileSync(path.join(dir, 'ast.json'), 'utf8')
      assert.equal(stringify(data.ast), code, 'tokens do match')
    })
  })
}
