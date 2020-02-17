import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
const { httpsPort, port } = require('./integration/fixtures/config')

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const extensions = ['.js', '.ts']
const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

function createConfig(entry, out) {
  return [
    // browser
    {
      input: `./src/${entry}`,
      output: {
        name: `streamsql`, // variable name to export to
        file: `integration/fixtures/${out}.min.js`,
        format: `umd`,
        amd: {
          id: `streamsql`,
        },
      },
      plugins: [
        babel(
          getBabelOptions(
            { useESModules: false },
            '> 0.1%, IE 10' // 95% global
          )
        ),
        resolve({ extensions }),
        replace({
          __APIHOST__: !!process.env.USE_SSL
            ? `https://wildcard.localhost.com:${httpsPort}`
            : `http://localhost:${port}`,
        }),
        terser(),
      ],
    },
  ]
}

export default [...createConfig('index.umd', 'streamsql')]
