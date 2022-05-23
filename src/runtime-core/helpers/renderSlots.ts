import { createVNode } from "../vnode";

export function renderSlots(slots, name, props){
  // return createVNode("div", {}, slots)
  const slot = slots[name];
  if(slot) {
    // return createVNode("div", {}, slot)
    if(typeof slot === "function") {
      return createVNode("div", {}, slot(props))
    }
  }
}