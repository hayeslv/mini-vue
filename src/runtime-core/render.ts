import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // TODO 处理组件
  processComponent(vnode, container)


  // TODO 处理元素
}

function processComponent(vnode, container) {
  // 挂载组件
  mountComponent(vnode, container)
  // TODO 更新组件
}

function mountComponent(vnode: any, container: any) {
  // 抽离出 instance 实例，表示组件实例
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
}

