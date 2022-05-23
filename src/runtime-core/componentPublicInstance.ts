import { hasOwn } from "../shared"


const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots
}

export const PublicInstanceProxyHandlers = {
  // ====== 在target这里获取_，改名为 instance ======
  get({ _: instance }, key) { // target 就是ctx，key对应 this.msg 中的 msg
    const { setupState, props } = instance // 组件setup()函数返回的对象
    // if(key in setupState) { // 如果当前访问的 key 在 setupState 上，则直接返回
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