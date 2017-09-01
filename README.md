# freemarkerjs

[![Build Status](https://travis-ci.org/armano2/freemarkerjs.svg?branch=master)](https://travis-ci.org/armano2/freemarkerjs)
[![Coverage Status](https://codecov.io/gh/armano2/freemarkerjs/branch/master/graph/badge.svg)](https://codecov.io/gh/armano2/freemarkerjs)

FreemarkerJs is a javascript implementation of the Freemarker (http://freemarker.sourceforge.com).

## TODO:
  - basic interpolations
  - directives:
    - `#if`
      - `#elseif`
      - `#else`
    - `#list`
      - `#else`
    - `#include`
  - size builtin for arrays
  - comments `<#-- -->`
  - built-ins:
    - `toUpperCase`
    - `toLowerCase`
    - `capitalize`
    - `length`

  - support default values, i.e. `${user!"Anonymous"}`
  - null resistance in above expressions if in parenthesis
  - support methods, i.e. `${avg(3, 5)}`
  - alternative syntax if starts with `[#ftl]`
  - directives: http://freemarker.sourceforge.net/docs/ref_directives.html
    - `#assign`
    - `#attempt`
    - `#compress`
    - `#default`
    - `#escape`
      - `#noescape`
    - `#fallback`
    - `#function`
    - `#flush`
    - `#global`
    - `#import`
    - `#local`
    - `#lt`
    - `#macro`
    - `#nested`
    - `#nt`
    - `#recover`
    - `#recurse`
    - `#return`
    - `#rt`
    - `#setting`
    - `#stop`
    - `#switch`
      - `#case`
      - `#break`
    - `#t`
    - `#visit`

  - string builtin for booleans, i.e. `boolean?string("yes", "no")`
  - Remove deprecated `escape` / `unescape`
