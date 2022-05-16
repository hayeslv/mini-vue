import { effect } from "../reactivity/effect";
import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options){

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  // n1 -> 老的虚拟节点
  // n2 -> 新的虚拟节点
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2
  
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }
  
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }
  
  function processFragment(n1, n2, container, parentComponent): void {
    mountChildren(n2, container, parentComponent) // 渲染全部children
  }
  
  function processElement(n1, n2, container, parentComponent) {
    // element 类型也分为 mount 和 update
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log("patchElement");
  }
  
  function mountElement(vnode, container, parentComponent) {
    const el = vnode.el = hostCreateElement(vnode.type)
    // children可能是：string、array
    const { props, children, shapeFlag } = vnode
  
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }
  
    // props
    for (const key in props) {
      const val = props[key]
  
      // 判断是否是事件的命名规范
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase()
      //   el.addEventListener(event, val)
      // } else {
      //   el.setAttribute(key, val)
      // }
  
      // 通用
      hostPatchProp(el, key, val)
    }
  
    // 挂载到 container
    // container.append(el)
    hostInsert(el, container)
  }
  
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => {
      patch(null, v, container, parentComponent)
    })
  }
  
  function processComponent(n1, n2, container, parentComponent) {
    // 挂载组件
    mountComponent(n2, container, parentComponent)
    // TODO 更新组件
  }
  
  function mountComponent(initinalVNode, container, parentComponent) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(initinalVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }
  
  function setupRenderEffect(instance, container) {
    effect(() => {
      if(!instance.isMounted) { // 初始化
        const { proxy, vnode } = instance
        // 虚拟节点树
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance)
      
        // 此处可以确定所有的 element 都被 mount 了
        vnode.el = subTree.el

        instance.isMounted = true;
      } else { // 更新
        const { proxy, vnode } = instance
        // 虚拟节点树
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree

        instance.subTree = subTree // 更新 subTree

        patch(preSubTree, subTree, container, instance)

      }
    })
  }

  return {
    createApp: createAppApi(render),
  }
}

// export function render(vnode, container) {
//   patch(vnode, container, null)
// }



