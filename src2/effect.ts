import { extend } from "./shared";

class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    // 当调用用户传入的 fn 之后，需要把 fn 的返回值给返回出去
    return this._fn();
  }
  stop() {
    // this.deps.forEach((dep: any) => {
    //   dep.delete(this);
    // });
    // !代码优化，第一步：提取成函数
    // cleanupEffect(this);

    // !代码优化，第二步：可能会频繁调用stop，给个状态后，及时外部多次调用stop，也只会清空一次
    if (this.active) {
      cleanupEffect(this);
      if(this.onStop) {
        this.onStop()
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
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

  // activeEffect有可能是undefined，因为有可能是单纯的reactive，并没有使用 effect
  if(!activeEffect) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep); // 反向添加：effect可以知道自己存储在哪些 dep 中
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);

  for (const effect of dep) {
    // 触发依赖的时候，看看effect中是否有 scheduler，如果有的话就执行，没有的话才会执行run方法
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // 接收 options 对象，获取scheduler
  const _effect = new ReactiveEffect(fn, options.scheduler);

  // !这里需要重构一下，因为后续可能有很多的options
  // _effect.onStop = options.onStop;
  // !重构1
  // Object.assign(_effect, options)
  // !重构2：具有语义化一些
  extend(_effect, options)

  _effect.run();

  // runner需要调用fn，相当于run方法的功能
  // 在 _effect.run 里面涉及到 this 指针的问题
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect; // 双向挂载：effect能得到 runner，runner中也保存effect

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
