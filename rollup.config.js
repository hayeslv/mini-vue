import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
  input: "./src/index.ts",
  output: [
    // 1.cjs -> commonjs
    {
      format: "cjs",
      file: pkg.main
    },
    // 2.esm -> esmodule
    {
      format: "es",
      file: pkg.module
    }
  ],
  plugins: [
    // 需要把ts编译一下，rollup是不理解ts的
    typescript()
  ]
}