import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // ShapeFlags
  // 判断vnode是不是一个 element
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initinalVNode: any, container) {
  const instance = createComponentInstance(initinalVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initinalVNode, container);
}

function setupRenderEffect(instance: any, initinalVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  initinalVNode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
  // init -> update
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type));

  const { children, props, shapeFlag } = vnode;

  if (shapeFlag && ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag && ShapeFlags.ARRAY_CHILDREN) {
    // children.forEach((v) => {
    //   patch(v, el);
    // });
    mountChildren(vnode, el);
  }

  // props
  for (const key in props) {
    const val = props[key];
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val);
    }
  }

  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}
