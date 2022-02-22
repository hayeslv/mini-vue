import { readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // readonly和reactive没太大区别，但是它不能被 set（不会触发依赖）
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  });

  it("warn then call set", () => {
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toBeCalled();
  });
});
