import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    return h(
      "div", 
      {
        id: "root",
        class: "red",
        onClick() {
          console.log('my click');
        },
        onMousedown() {
          console.log('mouse downnnnn');
        }
      },
      [
        h("div", {}, "hi, " + this.msg),
        h(Foo, { count: 1 })
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue111'
    }
  }
}