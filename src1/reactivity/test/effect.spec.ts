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
});
