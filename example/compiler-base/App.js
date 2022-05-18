import { ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  template: `<div>hi,{{count}}</div>`,
  // template: `<div>hi,{{message}}</div>`,
  setup() {
    const count = (window.count = ref(1));
    return {
      count,
    };
    // return {
    //   message: "mini-vue"
    // }
  },
};