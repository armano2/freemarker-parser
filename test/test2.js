const freemarker = require('../index')
const fs = require('fs')

const parser = new freemarker.Parser()

const file = fs.readFileSync('./test/test.ftl', 'utf8')
console.log(file)
console.log(parser)
const ast = parser.parse(file)
console.log(ast)
