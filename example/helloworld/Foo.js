import { h } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  // setup 第一个参数接收传进来的 props
  setup(props) {
    console.log(props);
  },
  render() {
    // 通过 this.count，访问 props 里面的 count
    return h("div", {}, "foo: " + this.count);
  }
}