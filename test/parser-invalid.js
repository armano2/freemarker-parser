const freemarker = require('../index')
const fs = require('fs')
const path = require('path')
const assert = require('assert')
const lineColumn = require('line-column')

const parser = new freemarker.Parser()

const testsPath = path.join(__dirname, '/resource/invalid/')
const tests = fs.readdirSync(testsPath)
  .filter(f => fs.statSync(path.join(testsPath, f)).isDirectory())

function stringify (text) {
  return JSON.stringify(text, null, 2)
}

for (const name of tests) {
  describe(name, function () {
    const dir = path.join(testsPath, name)
    let errors = {}
    const file = path.join(dir, 'template.ftl')

    it('should have error', function () {
      const template = fs.readFileSync(file, 'utf8')
      try {
        parser.parse(template)
        assert.fail('This test should have an error')
      } catch (e) {
        errors = {
          message: e.message
        }
        if (e.nodeType) {
          errors.loc = lineColumn(template).fromIndex(e.start)
        }
      }
    })
    it('should have valid error', function () {
      const code = fs.readFileSync(path.join(dir, 'error.json'), 'utf8')
      assert.equal(stringify(errors), code, 'errors do not match')
    })
  })
}
