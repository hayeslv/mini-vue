class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this; // 调用 run 的时候表示当前 effect 是正在执行的状态，把它赋值给 activeEffect
    this._fn();
  }
}

const targetMap = new Map();
let activeEffect;

export function track(target, key) {
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
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);

  for (const effect of dep) {
    effect.run();
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}
