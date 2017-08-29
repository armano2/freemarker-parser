const resolve = require('rollup-plugin-node-resolve')
const sourcemaps = require('rollup-plugin-sourcemaps')

const pkg = require('./package.json')

const external = Object.keys(pkg.dependencies)

module.exports = {
  entry: '.temp/index.js',
  external,
  dest: 'index.js',
  format: 'cjs',
  sourceMap: true,
  sourceMapFile: 'index.js.map',
  plugins: [
    sourcemaps(),
    resolve({external})
  ]
}
