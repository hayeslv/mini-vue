
let activeEffect
const targetMap = new Map()

class ReactiveEffect {
  private _fn: any
  deps = []
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    // 调用 run 的时候表示当前 effect 是正在执行的状态，把它赋值给 activeEffect
    activeEffect = this
    
    // 当调用用户传入的 fn 之后，需要把 fn 的返回值给返回出去
    return this._fn()
  }
  stop() {
    this.deps.forEach((dep: any) => {
      dep.delete(this)
    })
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

  // activeEffect有可能是undefined，因为有可能是单纯的reactive，并没有使用 effect
  if(!activeEffect) return
  // effect收集依赖的过程是在run方法执行中
  // 所以是先执行run方法，这里可以保证 activeEffect 已经有值了
  dep.add(activeEffect)
  // 反向收集：effect可以知道自己被存储在哪些 dep 中
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  // 基于target和key取出dep，执行effect的run方法（用户传入的fn）
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    // 触发依赖的时候，看看effect中是否有 scheduler，如果有的话就执行，没有的话才会执行run方法
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  // 封装，用类进行表示
  // 接收 options 对象，获取scheduler
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 当调用effect的时候，直接执行内部的fn（封装在run方法中）
  _effect.run()

  // runner需要调用fn，相当于run方法的功能
  // 在 _effect.run 里面涉及到 this 指针的问题
  const runner: any = _effect.run.bind(_effect)
  // 双向挂载：effect能得到 runner，runner中也保存effect
  runner.effect = _effect

  return runner
}

export function stop(runner){
  runner.effect.stop();
}
