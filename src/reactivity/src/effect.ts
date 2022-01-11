
let activeEffect = void 0;
let shouldTrack = false;
const targetMap = new WeakMap();

// 用于依赖收集
export class ReactiveEffect {
  active = true;
  deps = [];
  public onStop?: () => void;
  constructor(public fn, public scheduler?) {
    console.log("创建 ReactiveEffect 对象");
  }

  run() {
    console.log("run");
    // 运行 run 的时候，可以控制要不要执行后续收集依赖的一步
    // 目前来看的话，只要执行了 fn，那么久默认执行了收集依赖
    // 这里就需要控制了

    // 是不是收集依赖的变量

    // 执行 fn 但是不收集依赖
    if(!this.active) {
      return this.fn();
    }

    // 执行 fn 收集依赖---可以开始收集依赖了
    shouldTrack = true;

    // 执行的时候给全局的 activeEffect 赋值
    // 利用全局属性来获取当前的 effect
    activeEffect = this as any;
    // 执行用户传入的 fn
    console.log("执行用户传入的 fn");
    const result = this.fn();
    // 重置
    shouldTrack = false;
    activeEffect = undefined;

    return result;
  }

  stop() {
    if(this.active) {
      // 如果第一次执行 stop 后 active 就 false 了
      // 这是为了防止重复的调用，执行 stop 逻辑
      cleanupEffect(this);
      if(this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  // 找到所有依赖这个 effect 的响应式对象
  // 从这些响应式对象里面把 effect 给删除掉
  effect.deps.forEach(dep => {
    dep.delete(effect);
  });

  effect.deps.length = 0;
}

export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn);

  // 把用户传过来的值合并到 _effect 对象上去
  // 缺点：不是显示的，看代码的时候并不知道有什么值
  extend(_effect, options);
  _effect.run();

  // 把 _effect.run 这个方法返回
  // 让用户可以自行选择调用的时机（调用 fn）
  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}