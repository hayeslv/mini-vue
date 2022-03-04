import { track, trigger } from "./effect";

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);

    if (!isReadonly) {
      track(target, key);
    }

    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);

    trigger(target, key);

    return res;
  };
}

export const mutableHandlers = {
  get: createGetter(),
  set: createSetter(),
};
export const readonlyHanders = {
  get: createGetter(true),
  set(target, key, value) {
    console.warn(`只读属性不可编辑：${target}`);
    return true;
  },
};