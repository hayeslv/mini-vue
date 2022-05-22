function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // 安装组件（初始化组件）
    // TODO initProps()
    // TODO initSlots()
    // 处理component调用setup之后的返回值（初始化一个有状态的component）
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setup 可以返回 function 或 Object
        // function：组件的render函数
        // Object：会把Object对象注入到当前组件上下文中
        const setupResult = setup();
        // 处理setup的结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 基于上述的两种情况（setup可能会返回function或object）来做实现
    // TODO function
    if (typeof setupResult === "object") {
        // 将对应的值赋值到组件实例上
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // 将组件上的render函数赋值给instance实例
    instance.render = Component.render;
}

function render(vnode, container) {
    patch(vnode);
}
function patch(vnode, container) {
    // TODO 处理组件
    processComponent(vnode);
    // TODO 处理元素
    // processElement()
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode);
    // TODO 更新组件
}
function mountComponent(vnode, container) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(vnode);
    // 安装component
    setupComponent(instance);
    // 安装render
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 获取render函数的返回值（返回的是组件的虚拟节点树）
    const subTree = instance.render();
    // 基于返回的虚拟节点，对其进行patch比对（打补丁）
    patch(subTree);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成 vnode，后续所有的逻辑操作，都会基于虚拟节点做处理
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
