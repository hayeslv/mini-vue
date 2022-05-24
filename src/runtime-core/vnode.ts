import { ShapeFlags } from "../shared";

export const Fragment = Symbol("Fragment")

export function createVNode(type, props?, children?){
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type), // 基于 type 获取 shapeFlag
    el: null
  };

  // children
  if(typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 组件 + children（object）：才需要slots
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if(typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type === "string" ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}