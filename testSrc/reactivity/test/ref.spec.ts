import { effect } from "../effect";
import { reactive } from "../reavtive";
import { isRef, proxyRefs, ref, unRef } from "../ref";

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
  it("isRef", () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });
  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });
  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaohong",
    };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("xiaohong");

    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  });
});
