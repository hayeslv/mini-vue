import { h, provide, inject } from '../../lib/guide-mini-vue.esm.js'

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [
      h("p", {}, "Provider"),
      // h(ProviderTwo)
      h(Consumer)
    ])
  }
}

const ProviderTwo = {
  name: "ProviderTwo",
  setup() {
    provide("foo", "fooValTwooo");
    const foo = inject("foo")

    return { foo }
  },
  render() {
    return h("div", {}, [
      h("p", {}, `ProviderTwo foo: ${this.foo}`),
      h(Consumer)
    ])
  }
}

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    const baz = inject("baz", "bazDefault"); // 取不到值的话，默认值为bazDefault
    const bazfunc = inject("baz", () => "bazfuncDefault"); // 默认值传入函数

    return { foo, bar, baz, bazfunc }
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.bazfunc}`)
  }
}

export const App = {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [
      h("p", {}, "apiInject"),
      h(Provider)
    ])
  },
}