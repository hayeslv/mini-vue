import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props){
  const slot = slots[name];
  if(slot) {
    if(typeof slot === "function") {
      // 只需要把第三个参数（也就是这里的 children）渲染出来就行了
      // 将 div 修改为 Fragment（特殊的type）
      return createVNode(Fragment, {}, slot(props))
    }
  }
}