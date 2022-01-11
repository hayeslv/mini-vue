
import { Fragment, Text } from "./vnode";
import { createAppAPI } from "./createApp";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setText: hostSetText,
    createText: hostCreateText
  } = options;

  const render = (vnode, container) => {
    // debug.mainPath("调用 patch")();
    // patch(null, vnode, container);

    // function patch(n1, n2, container = null, anchor = null, parentComponent = null) {
    //   // 基于n2的类型来判断，因为n2是新的 vnode
    //   const { type, shapeFlag } = n2;
    //   switch (type) {
    //     case Text: 

    //   }
    // }
  }

  return {
    createApp: createAppAPI(render)
  };
}