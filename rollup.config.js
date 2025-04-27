import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  // UMD版本 (浏览器兼容, 压缩)
  {
    input: 'src/index.js',
    output: {
      name: 'FitScreenJS',
      file: pkg.main,
      format: 'umd',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      terser(),
    ],
  },

  // ESM版本 (ES模块, 不压缩)
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es',
    },
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
]
