import { extend, isObject } from "../share";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reavtive";

const createGetter = (isReadonly = false, shallow = false) => {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    if (shallow) {
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
};
const createSetter = () => {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
};

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHanders = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`readonly 不允许被赋值：${target}`);
    return true;
  },
};

export const shallowReadonlyHanders = extend({}, readonlyHanders, {
  get: shallowReadonlyGet,
});
