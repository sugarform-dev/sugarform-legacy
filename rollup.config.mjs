/* eslint-disable camelcase */
/* eslint-disable no-restricted-exports */
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { swc, defineRollupSwcOption, minify, defineRollupSwcMinifyOption } from 'rollup-plugin-swc3';
import packageJson from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: false,
      },
    ],
    plugins: [
      commonjs({
        include: [ 'node_modules/**' ],
      }),
      swc(defineRollupSwcOption({
        exclude: /tests/,
        sourceMaps: false,
      })),
      minify(defineRollupSwcMinifyOption({
        compress: {},
        mangle: {},
      })),
    ],
    external: [ 'react', 'react-dom' ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/cjs/index.d.ts', format: 'cjs' }],
    plugins: [ tsConfigPaths(), dts() ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/esm/index.d.ts', format: 'esm' }],
    plugins: [ tsConfigPaths(), dts() ],
  },
];
