import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import license from 'rollup-plugin-license';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { argv } from 'yargs';

import pkg from './package.json';

const isProduction = argv.prod === true;
const OUTPUT_PATH = 'dist';

const getPlugins = prod => [
  resolve({
    browser: true
  }),
  commonjs(),
  json(),
  replace({
    __DEV__: prod ? 'false' : 'true',
    'process.env.NODE_ENV': prod ? "'production'" : "'development'"
  }),
  prod &&
    terser({
      compress: { warnings: false },
      output: { comments: false },
      mangle: false
    }),
  license({
    banner: `
    <%= pkg.name %> v<%= pkg.version %>
    Author: bucharitesh
    Date: <%= moment().format('YYYY-MM-DD') %>
    License: MIT
    `
  })
];

const prodFiles = [
  {
    input: 'src/index.js',
    output: [
      {
        name: 'FlamSaasSDK',
        file: pkg.main,
        format: 'umd',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: getPlugins(isProduction)
  }
];
const devFiles = [
  {
    input: 'src/index.js',
    output: {
      name: 'FlamSaasSDK',
      file: `${OUTPUT_PATH}/FlamSaasSDK.js`,
      format: 'umd',
      sourcemap: isProduction ? false : 'inline',
      exports: 'named'
    },
    plugins: [...getPlugins(false)]
  }
];

const finalFiles = [...devFiles];
if (isProduction) {
  finalFiles.push(...prodFiles);
}
export default finalFiles;
