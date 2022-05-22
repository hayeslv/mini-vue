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
  // 安装component
  setupComponent(instance)
  // 安装render
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  // 获取render函数的返回值（返回的是组件的虚拟节点树）
  const subTree = instance.render()
  // 基于返回的虚拟节点，对其进行patch比对（打补丁）
  patch(subTree, container)
}

