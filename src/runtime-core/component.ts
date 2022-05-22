export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance){
  // 安装组件（初始化组件）

  // TODO initProps()

  // TODO initSlots()

  // 处理component调用setup之后的返回值（初始化一个有状态的component）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type

  const { setup } = Component
  if(setup) {
    // setup 可以返回 function 或 Object
    // function：组件的render函数
    // Object：会把Object对象注入到当前组件上下文中
    const setupResult = setup()

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

