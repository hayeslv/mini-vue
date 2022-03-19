function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO initProps
    // TODO initSlots
    // 处理component调用setup之后的返回值（初始化一个有状态的component）
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // 首先要获取到用户给的配置
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // setup 可以返回 function 或 Object
        // function：组件的render函数
        // Object：会把Object对象注入到当前组件上下文中
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    // 保证组件的 render 一定是有值的
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    patch(vnode);
}
function patch(vnode, container) {
    // 处理组件
    processComponent(vnode);
    // TODO 处理元素
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode);
    // TODO 更新组件
}
function mountComponent(vnode, container) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    // 虚拟节点树
    const subTree = instance.render();
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
            // 先转换成 vnode
            // component -> vnode
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
