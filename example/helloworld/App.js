import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const App = {
  name: "App",
  render() {
    window.self = this; // 赋值this
    return h(
      "div", 
      {
        id: "root",
      },
      "hi, " + this.msg
    )
  },
  setup() {
    return {
      msg: 'mini-vue111'
    }
  }
}