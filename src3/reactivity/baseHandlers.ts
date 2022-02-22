import { track, trigger } from "./effect";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

// 高阶函数
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
  // get: createGetter(),
  get,
  // set: createSetter(),
  set
};

export const readonlyHanders = {
  // get: createGetter(true),
  get: readonlyGet,
  set(target, key, value) {
    console.warn('不能调用')
    return true;
  },
};
