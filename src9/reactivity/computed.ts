import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter) {
    this._getter = getter;

    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    // 当依赖的响应式对象发生改变的时候，需要把 _dirty 改为 true
    // 调用完一次 get 之后就锁上
    if (this._dirty) {
      this._dirty = false;
      // this._value = this._getter();
      this._value = this._effect.run();
    }

    return this._value;
  }
}
export function computed(getter) {
  return new ComputedRefImpl(getter);
}
