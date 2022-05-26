const EMPTY_OBJ = {};
const extend = Object.assign;
const isObject = (value) => {
    return value !== null && typeof value === "object";
};
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
// 烤串转驼峰
const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
    // _：匹配的内容 -(\w)； c：(\w) 的内容
    return c ? c.toUpperCase() : "";
});
// 首字母大写
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toHandlerKey = (str) => str ? "on" + capitalize(str) : "";

let activeEffect;
let shouldTrack;
const targetMap = new Map();
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        // 调用 run 的时候表示当前 effect 是正在执行的状态，把它赋值给 activeEffect
        activeEffect = this;
        shouldTrack = true;
        const result = this._fn();
        // 执行完成 fn 后，关掉 shouldTrack。因为它是一个全局变量
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            this.active = false;
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function track(target, key) {
    // activeEffect有可能是undefined，因为有可能是单纯的reactive，并没有使用 effect
    if (!isTracking())
        return;
    // 依赖不能重复，我们选择 Set 这个数据结构
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // effect收集依赖的过程是在run方法执行中
    // 所以是先执行run方法，这里可以保证 activeEffect 已经有值了
    if (dep.has(activeEffect))
        return; // 避免重复收集
    dep.add(activeEffect);
    // 反向收集：effect可以知道自己被存储在哪些 dep 中
    activeEffect.deps.push(dep);
}
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
function effect(fn, options = {}) {
    // 封装，用类进行表示
    // 接收 options 对象，获取scheduler
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    // 当调用effect的时候，直接执行内部的fn（封装在run方法中）
    _effect.run();
    // runner需要调用fn，相当于run方法的功能
    // 在 _effect.run 里面涉及到 this 指针的问题
    const runner = _effect.run.bind(_effect);
    // 双向挂载：effect能得到 runner，runner中也保存effect
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
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

class RefImpl {
    constructor(value) {
        this.__v_isRef = true; // 给它一个标识，说明自己是 ref
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果值改变了，再执行
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            // 触发依赖
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    // 有可能 ref 的使用过程中，并没有 effect，那么就不需要进行依赖收集了
    if (isTracking()) {
        // 收集依赖
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    // 看看是不是 ref 对象，如果是就返回 ref.value ，否则直接返回值（ref）
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
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
    // 组件 + children（object）：才需要slots
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            // 只需要把第三个参数（也就是这里的 children）渲染出来就行了
            // 将 div 修改为 Fragment（特殊的type）
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function emit(instance, event, ...args) {
    const { props } = instance;
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
    $slots: (i) => i.slots
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

function initSlots(instance, children) {
    // 检查一下是否需要slots处理
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // 直接调用一下 value 
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { },
    };
    // 使用 bind 初始化 emit，用户使用的时候只需要传事件名，但是真实的 emit 实现中也可以拿到 instance 了
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 安装组件（初始化组件）
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
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
        // currentInstance = instance
        setCurrentInstance(instance);
        // setup 可以返回 function 或 Object
        // function：组件的render函数
        // Object：会把Object对象注入到当前组件上下文中
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit // 挂载emit
        });
        // currentInstance = null // 清空
        setCurrentInstance(null);
        // 处理setup的结果
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // 基于上述的两种情况（setup可能会返回function或object）来做实现
    // TODO function
    if (typeof setupResult === "object") {
        // 将对应的值赋值到组件实例上
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // 将组件上的render函数赋值给instance实例
    instance.render = Component.render;
}
// 借助全局变量来获取组件实例
let currentInstance = null;
function getCurrentInstance() {
    // 返回组件实例
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存数据
    // 获取当前组件的实例对象
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides; // 父组件的 provides
        if (provides === parentProvides) { // 如果当前provides和其父组件相同，说明其还没有被赋值过
            // 将当前实例 provides 的原型指向父级 provides
            // 并且只有初始化的时候才可以执行
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取数据
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成 vnode，后续所有的逻辑操作，都会基于虚拟节点做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    // n1 代表老的虚拟节点
    // n2 代表新的虚拟节点
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default: // 不是特殊的类型，继续走之前的逻辑
                if (shapeFlag & 1 /* ELEMENT */) {
                    // 处理元素
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = n2.el = document.createTextNode(children);
        container.append(textNode);
    }
    function processComponent(n1, n2, container, parentComponent) {
        // 挂载组件
        mountComponent(n2, container, parentComponent);
        // TODO 更新组件
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container, parentComponent);
        }
    }
    function patchElement(n1, n2, container, parentComponent) {
        console.log('patchElement');
        // 更新对比
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = n2.el = n1.el; // n1.el是初始化得到的，赋值给n2.el可以保证下次调用时（更新）可以拿到正确的 el
        patchChildren(n1, n2, el, parentComponent);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) { // 新节点是 text
            // 新节点是text，如果老节点是 arr 则需要清空，如果老节点是 text 则直接设置
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) { // 老节点是 array
                // 1.把老的 children 清空
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else { // 新节点是 array
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) { // 老节点是text
                hostSetElementText(container, ""); // 清空 text
                mountChildren(c2, container, parentComponent); // 挂载children
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // 循环新的Props
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // 循环老的Props
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 抽离出 instance 实例，表示组件实例
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 安装component
        setupComponent(instance);
        // 安装render
        setupRenderEffect(instance, container);
    }
    function mountElement(vnode, container, parentComponent) {
        // 新建节点--替换为稳定的接口
        const el = vnode.el = hostCreateElement(vnode.type);
        const { props, children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
            // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对其初始化
            mountChildren(vnode.children, el, parentComponent);
        }
        // props
        for (const key in props) {
            const value = props[key];
            // 添加属性--替换为稳定的接口
            hostPatchProp(el, key, null, value);
        }
        // 添加到视图--替换为稳定的接口
        hostInsert(el, container);
    }
    function mountChildren(children, container, parentComponent) {
        children.forEach(v => patch(null, v, container, parentComponent));
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy, vnode } = instance;
                // 获取render函数的返回值（返回的是组件render的虚拟节点树）
                const subTree = instance.subTree = instance.render.call(proxy);
                // 基于返回的虚拟节点，对其进行patch比对（打补丁）
                patch(null, subTree, container, instance);
                // 此处可以确定所有的 element 都被 mount 了
                vnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                // 更新
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
