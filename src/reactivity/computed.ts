import { ReactiveEffect } from './effect';
class ComputedRefImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any
  constructor(getter) {
    this._getter = getter

    // 这里的 _effect 已经被依赖收集了
    // 当响应式对象发生了改变，会触发 trigger，进而调用 this._effect.run 方法
    // 此时会调用 scheduler 方法（ReactiveEffect的第二个参数）
    this._effect = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    if(this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }

    return this._value
  }
}

export function computed(getter){
  return new ComputedRefImpl(getter)
}