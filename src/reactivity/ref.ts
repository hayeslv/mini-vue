import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any
  public __v_isRef = true // 给它一个标识，说明自己是 ref
  constructor(value){
    this._rawValue = value
    this._value = convert(value)

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
      this._value = convert(newValue)
      // 触发依赖
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
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

export function isRef(ref){
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 看看是不是 ref 对象，如果是就返回 ref.value ，否则直接返回值（ref）
  return isRef(ref) ? ref.value : ref;
}