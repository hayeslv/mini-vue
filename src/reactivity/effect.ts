import { extend } from "../shared";

let activeEffect;

class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEffect = this; // 调用run的时候，表示是正在执行的状态。让activeEffect等于当前的effect
    return this._fn();
  }
  stop() {
    if (this.active) {
      // 可能存在多次调用 stop 的情况，这里是做一下优化
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
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

  if(!activeEffect) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep); // effect反向收集dep：可能需要清除全部dep中的effect
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

  // _effect.onStop = options.onStop; // 第一版
  // Object.assign(_effect, options); // 重构
  extend(_effect, options); // 再次重构

  _effect.run(); // effect的回调函数是需要立即执行的

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
