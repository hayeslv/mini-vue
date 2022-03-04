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
  test("nested reactive", () => {
    // 嵌套了其他的 object
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    // 看看里面的值，是否是 reactive 的
    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
