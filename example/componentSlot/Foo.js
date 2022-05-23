import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup() {
    return {}
  },
  render() {
    const foo = h("p", {}, "foo")
    console.log(this.$slots);
    // return h("div", {}, [foo, this.$slots]);
    // return h("div", {}, [
    //   foo, 
    //   renderSlots(this.$slots)
    // ]);
    return h("div", {}, [
      renderSlots(this.$slots, "header"),
      foo, 
      renderSlots(this.$slots, "footer")
    ]);
  }
}