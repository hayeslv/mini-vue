

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
}

export const PublicInstanceProxyHandlers = {
  // 在target这里获取_，改名为 instance
  get({ _: instance }, key) { // key 应该对应 msg
    // setupState
    const { setupState } = instance
    if(key in setupState) {
      return setupState[key]
    }
    // $el
    // if(key === '$el') {
    //   return instance.vnode.el
    // }
    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) { // 目前它为 $el
      return publicGetter(instance)
    }
  }
}