import { createVNode } from "./vnode"

export function createAppApi(render){
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先转换成 vnode
        // component -> vnode
        const vnode = createVNode(rootComponent)
  
        render(vnode, rootContainer)
      }
    }
  }
}
