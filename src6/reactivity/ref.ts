import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  constructor(value) {
    // value => reactive
    this._rawValue = value;
    // 1.看看 value 是不是对象
    // this._value = isObject(value) ? reactive(value) : value;
    this._value = convert(value);

    this.dep = new Set();
  }
  get value() {
    // if (isTracking()) {
    //   // 依赖收集
    //   trackEffects(this.dep);
    // }
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // if (Object.is(newValue, this._value)) return;
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue;
      // 一定要先修改 value 的值，在去通知
      // this._value = isObject(newValue) ? reactive(newValue) : newValue;
      this._value = convert(newValue);
      // 触发依赖
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

function trackRefValue(ref) {
  if (isTracking()) {
    // 依赖收集
    trackEffects(ref.dep);
  }
}
