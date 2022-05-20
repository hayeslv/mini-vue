import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

// reactive其实就是 Proxy 的代理
export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shallowReadonly(raw){
  return createActiveObject(raw, shallowReadonlyHandlers)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value){
  return !!value[ReactiveFlags.IS_READONLY];
}

// 检测 object 是不是通过 reactive 或者 readonly 创建的
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}