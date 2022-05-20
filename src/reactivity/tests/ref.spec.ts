import { ref } from "../ref";

describe("ref", () => {
  it("happy path", () => {
    // ref给一个值1,返回a，通过a.value得到 1 这个值
    const a = ref(1);
    expect(a.value).toBe(1);
  });
});