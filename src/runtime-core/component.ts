import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode){
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  }

  return component
}

export function setupComponent(instance){
  initProps(instance, instance.vnode.props)
  // TODO initSlots
  // 处理component调用setup之后的返回值（初始化一个有状态的component）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 首先要获取到用户给的配置
  const Component = instance.type;

  // 通过 ctx 传递 instance
  instance.proxy = new Proxy({ _: instance }, 
    PublicInstanceProxyHandlers
    // {
    //   get(target, key) { // key 应该对应 msg
    //     // setupState
    //     const { setupState } = instance
    //     if(key in setupState) {
    //       return setupState[key]
    //     }
    //     // $el
    //     if(key === '$el') {
    //       return instance.vnode.el
    //     }
    //   }
    // }
  )

  const { setup } = Component;
  if(setup) {
    // setup 可以返回 function 或 Object
    // function：组件的render函数
    // Object：会把Object对象注入到当前组件上下文中
    const setupResult = setup(shallowReadonly(instance.props))

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO function
  if(typeof setupResult === "object") {
    instance.setupState = setupResult
  }
  // 保证组件的 render 一定是有值的
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  instance.render = Component.render
}

