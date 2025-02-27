import { defineConfig } from 'rollup';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/lib.mjs',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/lib.cjs',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript({
      exclude: ['test/**/*.test.ts', 'vitest.config.ts'],
      allowSyntheticDefaultImports: true,
    }),
    json(),
    resolve(),
    commonjs(),
    terser(),
  ],
});
