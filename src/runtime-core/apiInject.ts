import { getCurrentInstance } from "./component";

export function provide(key, value){
  // 存数据

  // 获取当前组件的实例对象
  const currentInstance: any = getCurrentInstance()
  if(currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides // 父组件的 provides
    
    if(provides === parentProvides) { // 如果当前provides和其父组件相同，说明其还没有被赋值过
      // 将当前实例 provides 的原型指向父级 provides
      // 并且只有初始化的时候才可以执行
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

export function inject(key, defaultValue){
  // 取数据

  const currentInstance: any = getCurrentInstance()

  if(currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if(key in parentProvides) {
      return parentProvides[key]
    } else if(defaultValue) {
      if(typeof defaultValue === "function") {
        return defaultValue()
      }
      return defaultValue
    }
  }
}