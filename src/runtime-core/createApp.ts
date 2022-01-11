import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    const app = {
      _component: rootComponent,
      mount(rootContainer) {
        console.log('基于根组件创建 vnode');
        const vnode = createVNode(rootComponent);
        console.log('调用render，基于vnode进行开箱');
        render(vnode, rootContainer);
      }
    }
    return app;
  }
}