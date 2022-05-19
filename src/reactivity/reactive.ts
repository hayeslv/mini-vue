import { mutableHandlers, readonlyHandlers } from "./baseHandlers";



// reactive其实就是 Proxy 的代理
export function reactive(raw) {
  return new Proxy(raw, mutableHandlers)
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandlers);
}