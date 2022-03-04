import { mutableHandlers, readonlyHanders } from "./baseHandler";

export const enum ReactiveFlags {
  REACTIVE = "__v_reactive",
  READONLY = "__v_readonly",
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanders);
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.READONLY];
}
