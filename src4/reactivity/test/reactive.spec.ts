import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);

    // 补一下测试
    expect(isReactive(observed)).toBe(true);
    // 会得到一个 undefined，因为没有触发 get
    expect(isReactive(original)).toBe(false);
  });
});
