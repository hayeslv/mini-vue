import { track, trigger } from "./effect";

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    
    if(!isReadonly) {
      // 依赖收集
      track(target, key)
    }

    return res;
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)

    // 触发依赖
    trigger(target, key)
    return res
  }
}


export const mutableHandlers = {
  get: createGetter(),
  set: createSetter()
}
export const readonlyHandlers = {
  get: createGetter(true),
  set(target, key, value) {
    console.warn(`readonly不能赋值：${target}`)
    return true
  },
}