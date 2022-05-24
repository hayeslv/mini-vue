import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App")
    const foo = h(Foo, {}, {
      header: ({age}) => [
        h("p", {}, "headerrrrr" + age),
        createTextVNode("你好！！") // 封装渲染函数
      ],
      footer: () => h("p", {}, "footerrrrrr"),
    })

    return h("div", {}, [app, foo])
  },
  setup() {
    return {}
  }
}