import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js';

window.self = null;

export const App = {
  name: "App",
  render() {
    window.self = this;
    return h("div", {
        id: "root",
        class: ["red", "hard"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mouse down");
        }
      }, 
      [
        h("div", {}, "hi," + this.msg), 
        h(Foo, {
          count: 1,
        })
      ]
      // "hi," + this.msg
      // "hi, mini-vue"
      // [
      //   h("p", { class: "red" }, "hi"),
      //   h("p", { class: "blue" }, "mini-vue"),
      // ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue111'
    }
  }
}