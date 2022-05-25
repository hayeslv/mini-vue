import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit";
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}, // 给定 setupState 初始值
    props: {}, // 声明 props 属性
    slots: {},
    provides: {},
    parent,
    emit: () => {},
  }

  // 使用 bind 初始化 emit，用户使用的时候只需要传事件名，但是真实的 emit 实现中也可以拿到 instance 了
  component.emit = emit.bind(null, component) as any;

  return component
}

export function setupComponent(instance){
  // 安装组件（初始化组件）

  initProps(instance, instance.vnode.props)

  initSlots(instance, instance.vnode.children)

  // 处理component调用setup之后的返回值（初始化一个有状态的component）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type

  // 使用空对象，叫做 ctx
  // ====== 通过 ctx 传递 instance ======
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component
  if(setup) {
    // currentInstance = instance
    setCurrentInstance(instance)
    // setup 可以返回 function 或 Object
    // function：组件的render函数
    // Object：会把Object对象注入到当前组件上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit // 挂载emit
    })
		// currentInstance = null // 清空
    setCurrentInstance(null)

    // 处理setup的结果
    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance: any, setupResult: any) {
  // 基于上述的两种情况（setup可能会返回function或object）来做实现

  // TODO function

  if(typeof setupResult === "object") {
    // 将对应的值赋值到组件实例上
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  // 将组件上的render函数赋值给instance实例
  instance.render = Component.render
}

// 借助全局变量来获取组件实例
let currentInstance = null
export function getCurrentInstance(){
  // 返回组件实例
  return currentInstance
}

export function setCurrentInstance(instance){
  currentInstance = instance
}
