import { reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    // 他俩绝对是不相等的
    expect(observed).not.toBe(original);
    // observed.foo 应该是 original.foo 的值
    expect(observed.foo).toBe(1);
  });
});
