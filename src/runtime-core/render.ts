import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  if(typeof vnode.type === "string") {
    processElement(vnode, container)
  } else if(isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  // element 类型也分为 mount 和 update，这里先实现mount
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  // children可能是：string、array
  const { props, children }  = vnode

  if(typeof children === "string") {
    el.textContent = children
  }else if(Array.isArray(children)) {
    // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对齐初始化
    // children.forEach(v => patch(v, el))
    mountChildren(vnode, el)
  }

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

function mountComponent(vnode, container) {
  // 抽离出 instance 实例，表示组件实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // 虚拟节点树
  const subTree = instance.render()
  patch(subTree, container)
}

