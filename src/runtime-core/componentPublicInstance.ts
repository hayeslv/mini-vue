import { hasOwn } from "../shared/index";

const publicProperiesMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    // if (key in setupState) {
    //   return setupState[key];
    // }
    // 重构
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    // if (key === "$el") {
    //   return instance.vnode.el;
    // }
    const publicGetter = publicProperiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
