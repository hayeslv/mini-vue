import { mutableHandlers, realdonlyHandlers } from "./baseHandlers";
import { track, trigger } from "./effect";

export function reactive(raw) {
  // return new Proxy(raw, mutableHandlers);
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  // return new Proxy(raw, realdonlyHandlers);
  return createActiveObject(raw, realdonlyHandlers);
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}
