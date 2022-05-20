import { hasChanged } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"

class RefImpl {
  private _value: any
  public dep
  constructor(value){
    this._value = value
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)

    return this._value
  }
  set value(newValue) {
    // 如果值改变了，再执行
    if(hasChanged(newValue, this._value)) {
      this._value = newValue
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