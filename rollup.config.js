/**
 * Reference https://dev.to/jimjunior/how-to-create-an-npm-library-from-react-components-2m2
 */

import babel from '@rollup/plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';

// the entry point for the library
const input = 'src/index.js'

// 
let MODE = [
  {
    fomart: 'cjs'
  },
  {
    fomart: 'esm'
  },
  {
    fomart: 'umd'
  }
]

const config = []

MODE.map((m) => {
  const conf = {
    input: input,
    output: {
      // then name of your package
      name: "@subter/react-tezos-domain-lookup",
      file: `dist/index.${m.fomart}.js`,
      format: m.fomart,
      exports: "auto",
      sourcemap: true
    },
    // this externelizes react to prevent rollup from compiling it
    external: ["react", /@babel\/runtime/],
    plugins: [
      // these are babel comfigurations
      babel({
        exclude: 'node_modules/**',
        plugins: ['@babel/transform-runtime'],
        babelHelpers: 'runtime'
      }),
      // this adds sourcemaps
      sourcemaps()
    ]
  }
  config.push(conf)
})

export default [
  ...config,
]
