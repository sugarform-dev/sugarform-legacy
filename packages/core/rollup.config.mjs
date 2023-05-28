import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import { swc, defineRollupSwcOption, minify, defineRollupSwcMinifyOption } from 'rollup-plugin-swc3';
import packageJson from './package.json' assert { type: 'json' };
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

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
    plugins: [ typescriptPaths({ preserveExtensions: true }), dts() ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/esm/index.d.ts', format: 'esm' }],
    plugins: [ typescriptPaths({ preserveExtensions: true }), dts() ],
  },
];
