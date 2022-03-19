import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
  input: "./src/index.ts",
  output: [
    // 库一般会打包多种类型：cjs、esm
    {
      format: "cjs",
      file: pkg.main
    },
    {
      format: "es",
      file: pkg.module
    }
  ],
  plugin: [
    // 需要把ts编译一下，rollup是不理解ts的
    typescript()
  ]
}