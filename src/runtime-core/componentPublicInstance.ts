
const publicProperiesMap = {
  $el: i => i.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }

    // if (key === "$el") {
    //   return instance.vnode.el;
    // }
    const publicGetter = publicProperiesMap[key]
    if(publicGetter) {
      return publicGetter(instance)
    }
  },
}