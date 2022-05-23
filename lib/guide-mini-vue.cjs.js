'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const targetMap = new Map();
function trigger(target, key) {
    // 基于target和key取出dep，执行effect的run方法（用户传入的fn）
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        // 触发依赖的时候，看看effect中是否有 scheduler，如果有的话就执行，没有的话才会执行run方法
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 处理嵌套逻辑：看看 res 是不是一个 object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`readonly不能赋值：${target}`);
        return true;
    },
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

// reactive其实就是 Proxy 的代理
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) { // 如果不是对象的情况
        console.warn(`target ${target}，必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    // 烤串转驼峰
    const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
        // _：匹配的内容 -(\w)； c：(\w) 的内容
        return c ? c.toUpperCase() : "";
    });
    // 首字母大写
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const toHandlerKey = (str) => str ? "on" + capitalize(str) : "";
    const handlerName = toHandlerKey(camelize(event)); // 加入烤串转驼峰方法
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    // 现在先将没有处理过的 props 赋值给 instance 就可以了
    // 后续还会在这里处理 arrts 等逻辑
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    // ====== 在target这里获取_，改名为 instance ======
    get({ _: instance }, key) {
        const { setupState, props } = instance; // 组件setup()函数返回的对象
        // if(key in setupState) { // 如果当前访问的 key 在 setupState 上，则直接返回
        //   return setupState[key]
        // }
        // 判断当前的key是否在当前的对象上
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
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
        setupState: {},
        props: {},
        emit: () => { },
    };
    // 使用 bind 初始化 emit，用户使用的时候只需要传事件名，但是真实的 emit 实现中也可以拿到 instance 了
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 安装组件（初始化组件）
    initProps(instance, instance.vnode.props);
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
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit // 挂载emit
        });
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
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ELEMENT */) {
        // 处理元素
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
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
function mountComponent(initialVNode, container) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(initialVNode);
    // 安装component
    setupComponent(instance);
    // 安装render
    setupRenderEffect(instance, container);
}
function mountElement(vnode, container) {
    const el = vnode.el = document.createElement(vnode.type);
    // children可能是：string、array
    const { props, children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对其初始化
        // 重构：children.forEach(v => patch(v, el))
        mountChildren(vnode, el);
    }
    // props
    for (const key in props) {
        const value = props[key];
        // 判断是否是事件的命名规范
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            el.setAttribute(key, value);
        }
        // if(key === "onClick") {
        //   el.addEventListener("click", value)
        // } else {
        //   el.setAttribute(key, value)
        // }
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
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
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
