import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: "App",
  render() {
    return h(
      "div", 
      {
        id: "root",
        // class: "red"
      },
      // string
      // "hi, mini-vue"
      // array
      [
        h("p", { class: "red" }, "hi"),
        h("p", { class: "blue" }, "mini-vue"),
      ]
    )
  },
  setup() {
    return {
      msg: 'mini-vue111'
    }
  }
}