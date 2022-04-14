import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode

  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent) // 渲染全部children
}

function processElement(vnode, container, parentComponent) {
  // element 类型也分为 mount 和 update，这里先实现mount
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
  const el = vnode.el = document.createElement(vnode.type)
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
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
    // if(key === "onClick") {
    //   el.addEventListener("click", val)
    // } else {
    //   el.setAttribute(key, val)
    // }
  }

  container.append(el)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent)
  })
}

function processComponent(vnode, container, parentComponent) {
  // 挂载组件
  mountComponent(vnode, container, parentComponent)
  // TODO 更新组件
}

function mountComponent(initinalVNode, container, parentComponent) {
  // 抽离出 instance 实例，表示组件实例
  const instance = createComponentInstance(initinalVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const { proxy, vnode } = instance
  // 虚拟节点树
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)

  // 此处可以确定所有的 element 都被 mount 了
  vnode.el = subTree.el
}

