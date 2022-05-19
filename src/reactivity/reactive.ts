import { mutableHandlers, readonlyHandlers } from "./baseHandlers";



// reactive其实就是 Proxy 的代理
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}