import { createVNode } from "./vnode"

export function createApp(rootComponent){
  return {
    mount(rootContainer) {
      // 先转换成 vnode，后续所有的逻辑操作，都会基于虚拟节点做处理
      const vnode = createVNode(rootComponent)
      render(vnode, rootContainer)
    }
  }
}

function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // TODO 处理组件
  // TODO 处理元素
}