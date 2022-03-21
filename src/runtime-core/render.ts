import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag } = vnode
  if(shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }

  // if(typeof vnode.type === "string") {
  //   processElement(vnode, container)
  // } else if(isObject(vnode.type)) {
  //   processComponent(vnode, container)
  // }
}

function processElement(vnode, container) {
  // element 类型也分为 mount 和 update，这里先实现mount
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const el = vnode.el = document.createElement(vnode.type)
  // children可能是：string、array
  const { props, children, shapeFlag }  = vnode

  if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }

  // if(typeof children === "string") {
  //   el.textContent = children
  // }else if(Array.isArray(children)) {
  //   // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对齐初始化
  //   // children.forEach(v => patch(v, el))
  //   mountChildren(vnode, el)
  // }

  // props
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container)
  })
}

function processComponent(vnode, container) {
  // 挂载组件
  mountComponent(vnode, container)
  // TODO 更新组件
}

function mountComponent(initinalVNode, container) {
  // 抽离出 instance 实例，表示组件实例
  const instance = createComponentInstance(initinalVNode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const { proxy, vnode } = instance
  // 虚拟节点树
  const subTree = instance.render.call(proxy)
  patch(subTree, container)

  // 此处可以确定所有的 element 都被 mount 了
  vnode.el = subTree.el
}

