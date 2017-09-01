const resolve = require('rollup-plugin-node-resolve')
const sourcemaps = require('rollup-plugin-sourcemaps')

const pkg = require('./package.json')

const external = Object.keys(pkg.dependencies)

module.exports = {
  input: '.temp/index.js',
  external,
  output: {
    file: 'index.js',
    format: 'cjs',
    sourcemap: true
  },
  sourcemapFile: 'index.js.map',
  plugins: [
    sourcemaps(),
    resolve({external})
  ]
}
