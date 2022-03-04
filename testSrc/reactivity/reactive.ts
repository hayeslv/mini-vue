import { mutableHandlers, readonlyHanders } from "./baseHandler";

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanders);
}

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler);
}
