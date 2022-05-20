import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });
  it("should compute lazily", () => {
    // 计算属性可以缓存
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    // 懒执行：如果没有调用cValue.value的话，getter不会调用
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // 当我们再次触发get操作，需要验证 getter 还是只被调用了一次
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // 当我们响应式的值发生改变了
    value.foo = 2; // set 触发 trigger -> effect -> get 重新执行
    expect(getter).toHaveBeenCalledTimes(1);

    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});