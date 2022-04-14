import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props){
  const slot = slots[name];
  if(slot) {
    // slot是一个function了
    if(typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props))
    }
  }
}