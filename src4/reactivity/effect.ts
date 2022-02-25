import { extend } from "../shared";

let activeEffect;
let shouldTrack; // 控制是否应该收集依赖
class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
  }
  run() {
    // 调用fn的时候就会收集依赖，这里使用 shouldTrack 来做区分
    // this.active来区分是否已经 stop 了
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false; // 执行完成 fn 后，关掉 shouldTrack。因为它是一个全局变量
    return result;
  }
  stop() {
    if (this.active) {
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
  effect.deps.length = 0; // 执行cleanupEffect 之后，里面的 dep 已经空了，这里把数组也清空
}

const targetMap = new Map();

export function track(target, key) {
  // if (!activeEffect) return;
  // if (!shouldTrack) return;
  if (!isTracking()) return; // 如果不需要 track 的话，后面的收集依赖也就不需要了。

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

  // 之前已经在 dep 中了，就没必要再添加进去了
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  // shouldTrack 为 true，并且 activeEffect 有值，说明应该是一个正在收集的状态
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key);

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
  extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
