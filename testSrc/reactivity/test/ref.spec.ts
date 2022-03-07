import { effect } from "../effect";
import { ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    // 依赖收集
    effect(() => {
      calls++;
      dummy = a.value;
    });
    
    expect(dummy).toBe(1); // 说明effect调用了一次
    expect(calls).toBe(1); // 说明获取到了a.value的值

    a.value = 2; // 把它变成 2 的之后，下面两个值都需要改变
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("should make nested properties reactive", () => {
    // 在ref中，如果传入的value是一个Object对象，则转换成 reactive
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });
});
