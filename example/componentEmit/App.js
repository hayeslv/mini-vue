import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    return h("div", {},
      [
        h("div", {}, "App"),
        h(Foo, {
          onAdd(a, b) { // 在Foo的第二个参数，使用 onAdd 接收 emit
            console.log("on-addddd");
            console.log('a:' + a);
            console.log('b:' + b);
          },
          onAddFoo() {
            console.log('烤串：add-foo');
          }
        })
      ]
    )
  },
  setup() {
    return {}
  }
}