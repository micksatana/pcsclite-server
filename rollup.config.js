import { defineConfig } from 'rollup';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/lib.cjs',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    typescript({
      include: ['src/**/*.ts'],
      exclude: ['test/**/*.test.ts', 'vitest.config.ts'],
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
      target: 'es2015',
    }),
    json(),
    resolve(),
    commonjs(),
    terser({
      format: {
        comments: false,
      },
      compress: true,
      mangle: false,
    }),
  ],
  external: ['crypto', 'fs', 'path', 'pcsclite'],
});
