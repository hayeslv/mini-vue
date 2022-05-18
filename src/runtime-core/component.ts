import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent){
  console.log("createComponentInstance:" + parent);
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    providers: parent ? parent.providers : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {}
  }

  // 填充emit的第一个参数（instance）
  component.emit = emit.bind(null, component) as any;

  return component
}

export function setupComponent(instance){
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
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
    // currentInstance只存在于setup函数中
    setCurrentInstance(instance)
    // setup 可以返回 function 或 Object
    // function：组件的render函数
    // Object：会把Object对象注入到当前组件上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO function
  if(typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult)
  }
  // 保证组件的 render 一定是有值的
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if(compiler && !Component.render) {
    if(Component.template) {
      Component.render = compiler(Component.template)
    }
  }
  // template
  instance.render = Component.render
}


let currentInstance = null;

export function getCurrentInstance(){
  return currentInstance
}

// 好处：当我们后续想要跟踪 currentInstance 被谁赋值的时候，我们只需要在这里操作就可以了
export function setCurrentInstance(instance){
  currentInstance = instance
}

let compiler

export function registerRuntimeCompiler(_compiler){
  compiler = _compiler
}

