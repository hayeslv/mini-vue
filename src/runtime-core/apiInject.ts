import { getCurrentInstance } from "./component";

export function provide(key, value) {
  // 存在当前组件实例对象上
  // 只能在setup中使用，因为这里使用到了 getCurrentInstance，这个函数是在setup作用域中存活的
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { providers } = currentInstance
    const parentProviders = currentInstance.parent.providers
    // init：让当前providers的原型链指向它的父级
    // 如果当前组件实例的providers和父级不一样了，那就说明已经初始化过了
    if (providers === parentProviders) {
      providers = currentInstance.providers = Object.create(parentProviders)
    }

    providers[key] = value
  }

}

export function inject(key, defaultValue) {
  // 取
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.providers
    if (key in parentProvides) {

      return parentProvides[key]
    } else if (defaultValue) {
      if(typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}