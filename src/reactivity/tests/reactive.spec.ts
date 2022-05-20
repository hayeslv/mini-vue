import { isProxy, isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    // 他俩绝对是不相等的
    expect(observed).not.toBe(original);
    // observed.foo 应该是 original.foo 的值
    expect(observed.foo).toBe(1);

    // 判断这个对象是否是 reactive 类型
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);

    // 使用 isProxy检测对象
    expect(isProxy(observed)).toBe(true);
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