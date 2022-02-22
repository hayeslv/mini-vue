import { mutableHandlers, readonlyHanders } from "./baseHandlers";
import { track, trigger } from "./effect";

// 高阶函数（移走了）
// function createGetter(isReadonly = false) {
//   return function get(target, key) {
//     const res = Reflect.get(target, key);

//     if(!isReadonly) {
//       track(target, key);
//     }
//     return res;
//   }
// }
// function createSetter() {
//   return function set(target, key, value) {
//     const res = Reflect.set(target, key, value);

//     trigger(target, key);
//     return res;
//   }
// }

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers);
  // return new Proxy(raw, mutableHandlers);

  // return new Proxy(raw, {
  //   // get(target, key) {
  //   //   const res = Reflect.get(target, key);

  //   //   track(target, key);
  //   //   return res;
  //   // },
  //   get: createGetter(),
  //   // set(target, key, value) {
  //   //   const res = Reflect.set(target, key, value);

  //   //   trigger(target, key);
  //   //   return res;
  //   // },
  //   set: createSetter()
  // });
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHanders);
  // return new Proxy(raw, readonlyHanders);

  // return new Proxy(raw, {
  //   // get(target, key) {
  //   //   const res = Reflect.get(target, key);

  //   //   return res;
  //   // },
  //   get: createGetter(true),
  //   set(target, key, value) {
  //     console.warn(`111`)
  //     return true
  //   },
  // });
}

function createActiveObject(raw, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

// 可以发现 readonly 和上面的 reactive 很类似
// 我们先把 get 抽离出来
// 为了保持我们代码的一致性，把 set 也抽离出来
// 接下来可以把 整个 reactive 抽离一下
