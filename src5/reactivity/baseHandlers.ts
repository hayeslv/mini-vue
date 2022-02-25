import { extend } from "./../../testSrc/share/index";
import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    // !如果是 shallow 类型的话，下面的嵌套就不要再执行了
    if (shallow) {
      return res;
    }

    // 处理嵌套逻辑：看看 res 是不是一个 object
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
  get,
  set,
};

export const readonlyHanders = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn("不能调用");
    return true;
  },
};

// set和readonlyHanders的set是一样的，所以这里直接使用 extend 扩展
export const shallowReadonlyHanders = extend({}, readonlyHanders, {
  get: shallowReadonlyGet,
});
