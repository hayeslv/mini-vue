import { createVNode } from "../vnode";

export function renderSlots(slots, name){
  // return createVNode("div", {}, slots)
  const slot = slots[name];
  if(slot) {
    return createVNode("div", {}, slot)
  }
}