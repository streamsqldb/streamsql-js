import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)
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

export default [
  // es6
  {
    input: `./src/index`,
    output: { file: `dist/streamsql.esm.js`, format: 'esm' },
    external,
    plugins: [
      babel(
        getBabelOptions(
          { useESModules: true },
          '>1%, not dead, not ie 11, not op_mini all' // 81% global
        )
      ),
      sizeSnapshot(),
      resolve({ extensions }),
      replace({
        __APIHOST__: 'https://streamsql.io',
      }),
    ],
  },
  // node
  {
    input: `./src/index`,
    output: { file: `dist/streamsql.cjs.js`, format: 'cjs' },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: false })),
      sizeSnapshot(),
      resolve({ extensions }),
      replace({
        __APIHOST__: 'https://streamsql.io',
      }),
    ],
  },
  // browser
  {
    input: `./src/index.umd`,
    output: {
      name: `streamsql`, // variable name to export to
      file: `dist/streamsql.min.js`,
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
      sizeSnapshot(),
      resolve({ extensions }),
      terser(),
      replace({
        __APIHOST__: 'https://streamsql.io',
      }),
    ],
  },
]
