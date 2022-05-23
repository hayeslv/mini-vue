'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (value) => {
    return value !== null && typeof value === "object";
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    // ====== 在target这里获取_，改名为 instance ======
    get({ _: instance }, key) {
        const { setupState } = instance; // 组件setup()函数返回的对象
        if (key in setupState) { // 如果当前访问的 key 在 setupState 上，则直接返回
            return setupState[key];
        }
        // if(key === "$el") {
        //   return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) { // 目前它为 $el
            return publicGetter(instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {} // 给定 setupState 初始值
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
    // 使用空对象，叫做 ctx
    // ====== 通过 ctx 传递 instance ======
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
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
    patch(vnode, container);
}
function patch(vnode, container) {
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        // 处理元素
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理组件
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
    // TODO 更新组件
}
function processElement(vnode, container) {
    // element 类型也分为 mount 和 update，这里先实现mount
    mountElement(vnode, container);
    // TODO 更新element
    // updateElement()
}
function mountComponent(vnode, container) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(vnode);
    // 安装component
    setupComponent(instance);
    // 安装render
    setupRenderEffect(instance, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    // children可能是：string、array
    const { props, children } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对其初始化
        // 重构：children.forEach(v => patch(v, el))
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(v => patch(v, container));
}
function setupRenderEffect(instance, container) {
    const { proxy, vnode } = instance;
    // 获取render函数的返回值（返回的是组件render的虚拟节点树）
    const subTree = instance.render.call(proxy);
    // 基于返回的虚拟节点，对其进行patch比对（打补丁）
    patch(subTree, container);
    // 此处可以确定所有的 element 都被 mount 了
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成 vnode，后续所有的逻辑操作，都会基于虚拟节点做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
