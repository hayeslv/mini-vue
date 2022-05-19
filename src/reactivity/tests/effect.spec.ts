import { effect } from "../effect";
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
});