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
    // 调用effect（fn）之后，其实是会返回一个 function（runner） 的，当调用 function 时会再次调用 传给 effect 的 fn 函数 ，当调用 fn 的时候会把 fn 的返回值返回出去
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "fooo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("fooo");
  });

  it("scheduler", () => {
    // 1. 通过 effect 的第二个参数给定了一个 scheduler 的函数
    // 2. effect 第一次执行的时候，还会执行 fn
    // 3. 当响应式对象 set update 的时候，不会执行 fn，而是执行 scheduler
    // 4. 如果执行 runner 的时候，会再次执行 fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    // 第一次触发依赖
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    // effect 回调函数应该没有再被执行
    expect(dummy).toBe(1);
    // 直接执行 run 方法
    run();
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
    obj.prop = 3;
    expect(dummy).toBe(2);

    // stop只是终止“依赖触发”的 effect 执行，不影响返回的 runner 函数
    runner();
    expect(dummy).toBe(3);
  });

  // it("onStop", () => {
  //   // 当用户调用 stop 之后，onStop 会被执行
  //   const obj = reactive({
  //     foo: 1,
  //   });
  //   const onStop = jest.fn();
  //   let dummy;
  //   const runner = effect(
  //     () => {
  //       dummy = obj.foo;
  //     },
  //     {
  //       onStop,
  //     }
  //   );

  //   stop(runner);
  //   expect(onStop).toHaveBeenCalledTimes(1);
  // });
});