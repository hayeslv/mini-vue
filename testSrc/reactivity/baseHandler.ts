import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { isReactive, reactive, ReactiveFlags, readonly } from "./reactive";

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);
    if(shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

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
export const shallowReadonlyHandlers = extend({}, readonlyHanders, {
  get: createGetter(true, true),
})
