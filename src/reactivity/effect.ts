
let activeEffect
const targetMap = new Map()

class ReactiveEffect {
  private _fn: any
  constructor(fn) {
    this._fn = fn
  }
  run() {
    // 调用 run 的时候表示当前 effect 是正在执行的状态，把它赋值给 activeEffect
    activeEffect = this
    
    // 当调用用户传入的 fn 之后，需要把 fn 的返回值给返回出去
    return this._fn()
  }
}

export function track(target, key) {
  // 依赖不能重复，我们选择 Set 这个数据结构
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // effect收集依赖的过程是在run方法执行中
  // 所以是先执行run方法，这里可以保证 activeEffect 已经有值了
  dep.add(activeEffect)
}

export function trigger(target, key) {
  // 基于target和key取出dep，执行effect的run方法（用户传入的fn）
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    effect.run()
  }
}

export function effect(fn) {
  // 封装，用类进行表示
  const _effect = new ReactiveEffect(fn)

  // 当调用effect的时候，直接执行内部的fn（封装在run方法中）
  _effect.run()

  // runner需要调用fn，相当于run方法的功能
  // 在 _effect.run 里面涉及到 this 指针的问题
  return _effect.run.bind(_effect)
}

