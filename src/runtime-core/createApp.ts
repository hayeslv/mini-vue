import { createVNode } from "./vnode"


export function createAppApi(render){
  return function createApp(rootComponent){
    return {
      mount(rootContainer) {
        // 先转换成 vnode，后续所有的逻辑操作，都会基于虚拟节点做处理
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
  }
}
