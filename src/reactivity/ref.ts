import { isTracking, trackEffects, triggerEffects } from "./effect"

class RefImpl {
  private _value: any
  public dep
  constructor(value){
    this._value = value
    this.dep = new Set()
  }
  get value() {
    // 有可能 ref 的使用过程中，并没有 effect，那么就不需要进行依赖收集了
    if(isTracking()){
      // 收集依赖
      trackEffects(this.dep)
    }

    return this._value
  }
  set value(newValue) {
    // 如果是相同的值，就直接 return 掉
    if(Object.is(newValue, this._value)) return

    this._value = newValue
    // 触发依赖
    triggerEffects(this.dep)
  }
}

export function ref(value){
  return new RefImpl(value)
}