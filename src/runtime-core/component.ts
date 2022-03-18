export function createComponentInstance(vnode){
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance){
  // TODO initProps
  // TODO initSlots
  // 处理component调用setup之后的返回值（初始化一个有状态的component）
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 首先要获取到用户给的配置
  const Component = instance.type;

  const { setup } = Component;
  if(setup) {
    // setup 可以返回 function 或 Object
    // function：组件的render函数
    // Object：会把Object对象注入到当前组件上下文中
    const setupResult = setup()

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
  if(Component.render) {
    instance.render = Component.render
  }
}

