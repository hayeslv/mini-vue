import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    // 创建出的props只能是最外层的对象是响应式对象，内部的（例如n）就不是响应式对象了。
    // 创建出的响应式对象是 Readonly 类型
    // 也就是 表层是 readonly，内部嵌套的都是正常的
    // 这种形式一般用于做程序中的一些优化，不然的话它会把所有的对象都转化成响应式对象
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
  });
  it("warn then call set", () => {
    console.warn = jest.fn();
    const user = shallowReadonly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toBeCalled();
  });
});
