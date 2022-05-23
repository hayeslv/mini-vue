

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
}

export const PublicInstanceProxyHandlers = {
  // ====== 在target这里获取_，改名为 instance ======
  get({ _: instance }, key) { // target 就是ctx，key对应 this.msg 中的 msg
    const { setupState } = instance // 组件setup()函数返回的对象
    if(key in setupState) { // 如果当前访问的 key 在 setupState 上，则直接返回
      return setupState[key]
    }

    // if(key === "$el") {
    //   return instance.vnode.el
    // }
    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) { // 目前它为 $el
      return publicGetter(instance)
    }
  }
}