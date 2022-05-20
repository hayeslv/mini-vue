import { effect } from "../effect";
import { ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    // ref给一个值1,返回a，通过a.value得到 1 这个值
    const a = ref(1);
    expect(a.value).toBe(1);
  });
  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    // 通过effect做依赖收集
    effect(() => {
      calls++;
      dummy = a.value;
    });
    
    expect(calls).toBe(1); // 说明effect调用了一次
    expect(dummy).toBe(1); // 说明获取到了a.value的值
  
    a.value = 2; // 把它变成 2 的之后，下面两个值都需要改变
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  
    // 相同值不再触发依赖
    // a.value = 2;
    // expect(calls).toBe(2);
    // expect(dummy).toBe(2);
  });
});