import { track, trigger } from "./effect";

export function reactive(raw) {
  return new Proxy(raw, {
    get: function (target, key) {
      const res = Reflect.get(target, key);

      track(target, key);
      return res;
    },
    set: function (target, key, value) {
      const res = Reflect.set(target, key, value);

      trigger(target, key);
      return res;
    },
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: function (target, key) {
      const res = Reflect.get(target, key);
      return res;
    },
    set: function (target, key, value) {
      console.warn('readonly')
      return true;
    },
  });
}
