import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App")
    // const foo = h(Foo, {}, [h("p", {}, "22222"), h("p", {}, "33333")])
    // const foo = h(Foo, {}, h("p", {}, "33333"))
    // 将数组替换为对象
    const foo = h(Foo, {}, {
      header: ({age}) => h("p", {}, "headerrrrr" + age),
      footer: () => h("p", {}, "footerrrrrr"),
    })

    return h("div", {}, [app, foo])
  },
  setup() {
    return {}
  }
}