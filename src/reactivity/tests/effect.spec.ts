import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  // 核心代码逻辑
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    // user.age：依赖收集
    // effect一上来会调用fn，然后会触发 user.age 的get操作，触发get时进行依赖收集
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    // 更新：触发依赖
    // 触发依赖：user.age触发set操作时，会把所有收集到的fn拿出来调用一下
    user.age++;
    expect(nextAge).toBe(12);
  });
  it("should return runner when call effect", () => {
    let foo = 10;
    // 返回一个 runner 函数
    const runner = effect(() => {
      foo++;
      return "fooo";
    });
    expect(foo).toBe(11);
    // 调用 runner 函数的时候，可以拿到返回值 r；并且fn也应该被执行了
    const r = runner();
    expect(foo).toBe(12); // 验证内部函数fn，是否被执行了
    expect(r).toBe("fooo"); // 验证对应的返回值
  });
  it("scheduler", () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    // 先调用 effect，传入 fn
    // 第二个参数是一个对象，里面有一个 scheduler
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    // 验证 scheduler 一开始不会被调用
    expect(scheduler).not.toHaveBeenCalled();
    // 验证一开始会执行 fn
    expect(dummy).toBe(1);
    // 第一次触发依赖
    obj.foo++;
    // 验证 scheduler 被执行了一次
    expect(scheduler).toHaveBeenCalledTimes(1);
    // 验证 effect 回调函数（fn）没有再被执行
    expect(dummy).toBe(1);
    // 直接执行 run 方法
    run();
    // 验证 run 可以执行 fn 
    expect(dummy).toBe(2);
  });
  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    // 调用 stop 的时候，应该把当前 effect 从 deps 中删除掉
    stop(runner);
    // obj.prop = 3;
    obj.prop++
    expect(dummy).toBe(2); // 停止更新

    // stop只是终止“依赖触发”的 effect 执行，不影响返回的 runner 函数
    runner();
    expect(dummy).toBe(3);
  });
  it("onStop", () => {
    // 当用户调用 stop 之后，onStop 会被执行
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});