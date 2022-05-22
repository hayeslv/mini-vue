import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: "App",
  render() {
    return h("div", "hi, mini-vue")
  },
  setup() {
    return {
      msg: 'mini-vue111'
    }
  }
}