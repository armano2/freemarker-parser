import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import LinesAndColumns, { SourceLocation } from 'lines-and-columns'

import { Parser } from '../src/index'
import NodeError from '../src/errors/NodeError';

interface TestError {
  message: string
  start?: SourceLocation
  end?: SourceLocation
}

const parser = new Parser()

const testsPath = path.join(__dirname, '/resource/invalid/')
const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

function stringify (text : TestError) {
  return JSON.stringify(text, null, 2)
}

for (const name of tests) {
  describe(name, function () {
    const dir = path.join(testsPath, name)
    let errors = {} as TestError
    const file = path.join(dir, 'template.ftl')

    it('should have error', function () {
      const template = fs.readFileSync(file, 'utf8')
      try {
        parser.parse(template)
        assert.fail('This test should have an error')
      } catch (e) {
        errors = { message: e.message }

        if (e instanceof NodeError) {
          const line = new LinesAndColumns(template)
          errors.start = line.locationForIndex(e.start) || undefined
          errors.end = line.locationForIndex(e.end) || undefined
        }
      }
    })
    it('should have valid error', function () {
      const code = fs.readFileSync(path.join(dir, 'error.json'), 'utf8')
      assert.equal(stringify(errors), code, 'errors do not match')
    })
  })
}
