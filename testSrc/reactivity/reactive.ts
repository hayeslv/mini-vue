import { mutationHandlers, readonlyHanders } from "./baseHandler";
import { track, trigger } from "./effect";

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export function reactive(raw) {
  return createActiveObject(raw, mutationHandlers);
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanders);
}
