import { effect } from "../effect";
import { reactive } from "../reactive";
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
    effect(() => {
      calls++;
      dummy = a.value;
    });

    expect(dummy).toBe(1);
    expect(calls).toBe(1);

    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);

    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });
  it("should make nested properties reactive", () => {
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
    // user中的age是一个 ref 类型
    const user = {
      age: ref(18),
      name: "xiaohong",
    };

    // ref类型只要给到proxyRefs之后，我们在后续去访问里面 ref 类型的时候，就可以省略.value了
    // 场景：使用在 template 里面，setup可能会返回 ref 值，但是在template里面不需要 .value
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(18);
    expect(proxyUser.age).toBe(18);
    expect(proxyUser.name).toBe("xiaohong");

    // set逻辑
    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});
