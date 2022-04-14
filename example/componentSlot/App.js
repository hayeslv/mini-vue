import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App")
    const foo = h(Foo, {}, {
      header: ({age}) => [
        h("p", {}, "headerrrrr" + age),
        createTextVNode("哈哈哈") // 渲染的时候必须是虚拟节点，这里把它转换成虚拟节点
      ],
      footer: () => h("p", {}, "footerrrrrr"),
    })

    return h("div", {}, [app, foo])
  },
  setup() {
    return {}
  }
}