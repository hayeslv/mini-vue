import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any
  constructor(value){
    this._rawValue = value
    this._value = isObject(value) ? reactive(value) : value

    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)

    return this._value
  }
  set value(newValue) {
    // 如果值改变了，再执行
    if(hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = isObject(newValue) ? reactive(newValue) : newValue
      // 触发依赖
      triggerEffects(this.dep)
    }
  }
}

function trackRefValue(ref) {
  // 有可能 ref 的使用过程中，并没有 effect，那么就不需要进行依赖收集了
  if(isTracking()){
    // 收集依赖
    trackEffects(ref.dep)
  }
}

export function ref(value){
  return new RefImpl(value)
}