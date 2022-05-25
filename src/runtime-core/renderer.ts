import { isObject, ShapeFlags } from './../shared';
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from './vnode';

export function render(vnode, container) {
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode

  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;
    default: // 不是特殊的类型，继续走之前的逻辑
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理元素
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

function processComponent(vnode, container, parentComponent) {
  // 挂载组件
  mountComponent(vnode, container, parentComponent)
  // TODO 更新组件
}

function processElement(vnode, container, parentComponent) {
  // element 类型也分为 mount 和 update，这里先实现mount
  mountElement(vnode, container, parentComponent)

  // TODO 更新element
  // updateElement()
}


function mountComponent(initialVNode: any, container: any, parentComponent) {
  // 抽离出 instance 实例，表示组件实例
  const instance = createComponentInstance(initialVNode, parentComponent)
  // 安装component
  setupComponent(instance)
  // 安装render
  setupRenderEffect(instance, container)
}

function mountElement(vnode, container, parentComponent) {
  const el = vnode.el = document.createElement(vnode.type)
  // children可能是：string、array
  const { props, children, shapeFlag } = vnode

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对其初始化
    // 重构：children.forEach(v => patch(v, el))
    mountChildren(vnode, el, parentComponent)
  }

  // props
  for (const key in props) {
    const value = props[key]

    // 判断是否是事件的命名规范
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, value)
    } else {
      el.setAttribute(key, value)
    }

    // if(key === "onClick") {
    //   el.addEventListener("click", value)
    // } else {
    //   el.setAttribute(key, value)
    // }
  }

  container.append(el)
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => patch(v, container, parentComponent))
}

function setupRenderEffect(instance, container) {
  const { proxy, vnode } = instance
  // 获取render函数的返回值（返回的是组件render的虚拟节点树）
  const subTree = instance.render.call(proxy)
  // 基于返回的虚拟节点，对其进行patch比对（打补丁）
  patch(subTree, container, instance)

  // 此处可以确定所有的 element 都被 mount 了
  vnode.el = subTree.el
}
