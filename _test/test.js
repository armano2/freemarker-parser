const assert = require('assert')
const parser = require('../_src').parser
const fs = require('fs')

/* eslint-disable no-template-curly-in-string */

function tester (items) {
  for (const item of items) {
    assert.equal(item.output, parser.render(item.template, item.data, item.directory || __dirname))
  }
}

describe('property', function () {
  it('should render property', function () {
    tester([
      {
        template: '${foo}',
        output: 'foo',
        data: {
          foo: 'foo'
        }
      },
      {
        template: '${foo.foo}',
        output: 'foo',
        data: {
          foo: { foo: 'foo' }
        }
      }
    ])
  })
})

describe('comment', function () {
  it('should be removed', function () {
    tester([{
      template: '<#-- -->a <#-- ${foo} -->a ',
      output: 'a a ',
      data: {}
    }, {
      template: ' <#-- ${foo} --> ',
      output: '  ',
      data: {}
    }, {
      template: '<#-- ${foo} -->',
      output: '',
      data: {}
    }, {
      template: `<#--

      csdcsdc

      -->`,
      output: '',
      data: {}
    }])
  })
})

describe('condition', function () {
  it('if', function () {
    tester([
      {
        template: `<#if x == 1>x is 1</#if>`,
        output: 'x is 1',
        data: {
          x: 1
        }
      },
      {
        template: `<#if x == 1>x is 1</#if>`,
        output: '',
        data: {
          x: 2
        }
      }
    ])
  })
  it('else', function () {
    tester([
      {
        template: `<#if x == 1>x is 1<#else>x is not 1</#if>`,
        output: 'x is 1',
        data: {
          x: 1
        }
      },
      {
        template: `<#if x == 1>x is 1<#else>x is not 1</#if>`,
        output: 'x is not 1',
        data: {
          x: 2
        }
      }
    ])
  })
  it('elseif', function () {
    tester([
      {
        template: `<#if x == 1>x is 1<#elseif x == 2>x is 2<#elseif x == 3>x is 3</#if>`,
        output: 'x is 1',
        data: {
          x: 1
        }
      },
      {
        template: `<#if x == 1>x is 1<#elseif x == 2>x is 2<#elseif x == 3>x is 3</#if>`,
        output: 'x is 2',
        data: {
          x: 2
        }
      },
      {
        template: `<#if x == 1>x is 1<#elseif x == 2>x is 2<#elseif x == 3>x is 3</#if>`,
        output: 'x is 3',
        data: {
          x: 3
        }
      },
      {
        template: `<#if x == 1>x is 1<#elseif x == 2>x is 2<#elseif x == 3>x is 3</#if>`,
        output: '',
        data: {
          x: 4
        }
      }
    ])
  })
})

describe('list', function () {
  it('iterate', function () {
    tester([{
      template: '<#list planets as planet>${planet?length} - ${planet} |</#list>',
      output: '7 - Mercury |5 - Venus |5 - Earth |4 - Mars |7 - Jupiter |6 - Saturn |6 - Uranus |7 - Neptune |',
      data: {
        planets: [
          'Mercury',
          'Venus',
          'Earth',
          'Mars',
          'Jupiter',
          'Saturn',
          'Uranus',
          'Neptune'
        ]
      }
    }])
  })
  it('iterate with else', function () {
    tester([{
      template: '<#list planets as planet>${planet?length} - ${planet} |<#else>Fooo</#list>',
      output: 'Fooo',
      data: {
        planets: []
      }
    }])
  })
})

describe('include', function () {
  it('should include', function () {
    tester([{
      template: fs.readFileSync('./test/include/test.ftl', 'utf8'),
      output: fs.readFileSync('./test/include/test_output.txt', 'utf8'),
      data: require('./include/test.json')
    }])
  })
})
