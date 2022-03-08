export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  };

  return component;
}

export function setupComponent(instance) {
  // TODO initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type;

  const { setup } = Component

  if(setup) {
    // function（render函数） Object（注入到组件的上下文中）
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO function

  if(typeof setupResult === "object") {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  if(Component.render) {
    instance.render = Component.render
  }
}
