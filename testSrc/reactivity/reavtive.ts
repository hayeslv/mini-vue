import {
  mutableHandlers,
  readonlyHanders,
  shallowReadonlyHanders,
} from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanders);
}

export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHanders);
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
