import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  name: "App",
  render() {
    window.self = this; // 赋值this
    // 添加第二个参数：props
    return h(
      "div", 
      {
        id: "root",
        class: "red",
        onClick() {
          console.log("click!!");
        }
      },
      "hi," + this.msg // 组件代理对象
      // String类型
      // "hi, mini-vue"
      // Array类型
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