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

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

export function reactive(raw) {
  return new Proxy(raw, {
    get,
    set,
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: readonlyGet,
    set(target, key, value) {
      console.warn("111");
      return true;
    },
  });
}

// export function reactive(raw) {
//   return new Proxy(raw, {
//     get(target, key) {
//       const res = Reflect.get(target, key);
//       track(target, key);
//       return res;
//     },
//     set(target, key, value) {
//       const res = Reflect.set(target, key, value);
//       trigger(target, key);
//       return res;
//     },
//   });
// }

// export function readonly(raw) {
//   return new Proxy(raw, {
//     get(target, key) {
//       const res = Reflect.get(target, key);
//       return res;
//     },
//     set(target, key, value) {
//       console.warn('111')
//       return true;
//     },
//   });
// }
