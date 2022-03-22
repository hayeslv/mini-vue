import { hasOwn } from "../shared/index"


const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots
}

export const PublicInstanceProxyHandlers = {
  // 在target这里获取_，改名为 instance
  get({ _: instance }, key) { // key 应该对应 msg
    const { setupState, props } = instance
    // if(key in setupState) {
    //   return setupState[key]
    // }

    // 判断当前的key是否在当前的对象上
    if(hasOwn(setupState, key)) {
      return setupState[key]
    } else if(hasOwn(props, key)) {
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) { // 目前它为 $el
      return publicGetter(instance)
    }
  }
}