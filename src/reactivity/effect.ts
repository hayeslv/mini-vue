let activeEffect;

class ReactiveEffect {
  private _fn: any;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this; // 调用run的时候，表示是正在执行的状态。让activeEffect等于当前的effect
    return this._fn();
  }
}

const targetMap = new Map();
export function track(target, key) {
  // dep 存储 effect中的fn：不能重复，所以使用 Set 这个数据结构

  // target -> key -> dep
  // target和key也都需要存一下，经过两步处理，才能拿到dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

export function trigger(target, key) {
  // 基于 target 和 key 来取出 dep 对象来，然后遍历执行之前所有收集到的 fn
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  _effect.run(); // effect的回调函数是需要立即执行的

  const runner = _effect.run.bind(_effect);

  return runner;
}
