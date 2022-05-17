import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options){

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  // n1 -> 老的虚拟节点
  // n2 -> 新的虚拟节点
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2
  
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break;
    }
  }
  
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }
  
  function processFragment(n1, n2, container, parentComponent, anchor): void {
    mountChildren(n2.children, container, parentComponent, anchor) // 渲染全部children
  }
  
  function processElement(n1, n2, container, parentComponent, anchor) {
    // element 类型也分为 mount 和 update
    if(!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log("patchElement");
    console.log("n1:", n1);
    console.log("n2:", n2);

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = n2.el = n1.el

    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新节点是“文本”
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老节点是“数组”
        // 1. 把老的 children 清空
        unmountChildren(n1.children)
      }
      if(c1 !== c2) {
        // 2. 设置 text
        hostSetElementText(container, c2)
      }
    } else {
      // 新节点是“数组”
      if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 老节点是“文本”
        hostSetElementText(container, "")
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 老节点是“数组”
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l2 = c2.length
    let i = 0;
    let e1 = c1.length - 1
    let e2 = l2 - 1

    // 1.左侧
    while(i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }

      i++;
    }

    // 2.右侧
    while(i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if(isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3.新的比老的多
    if(i > e1) {
      if(i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null 
        while(i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      } 
    }else if(i > e2) {
      // 4.老的比新的多
      while(i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 5.乱序的部分
    }



    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }
  }

  function unmountChildren(children) {
    for(let i=0; i<children.length; i++) {
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  

  function patchProps(el, oldProps, newProps) {
    if(oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if(prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if(oldProps !== EMPTY_OBJ) {
        for(const key in oldProps) {
          if(!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }
  
  function mountElement(vnode, container, parentComponent, anchor) {
    const el = vnode.el = hostCreateElement(vnode.type)
    // children可能是：string、array
    const { props, children, shapeFlag } = vnode
  
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }
  
    // props
    for (const key in props) {
      const val = props[key]
  
      // 通用
      hostPatchProp(el, key, null, val)
    }
  
    // 挂载到 container
    // container.append(el)
    hostInsert(el, container, anchor)
  }
  
  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(v => {
      patch(null, v, container, parentComponent, anchor)
    })
  }
  
  function processComponent(n1, n2, container, parentComponent, anchor) {
    // 挂载组件
    mountComponent(n2, container, parentComponent, anchor)
    // TODO 更新组件
  }
  
  function mountComponent(initinalVNode, container, parentComponent, anchor) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(initinalVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, container, anchor)
  }
  
  function setupRenderEffect(instance, container, anchor) {
    effect(() => {
      if(!instance.isMounted) { // 初始化
        const { proxy, vnode } = instance
        // 虚拟节点树
        const subTree = instance.subTree = instance.render.call(proxy)
        patch(null, subTree, container, instance, anchor)
      
        // 此处可以确定所有的 element 都被 mount 了
        vnode.el = subTree.el

        instance.isMounted = true;
      } else { // 更新
        const { proxy, vnode } = instance
        // 虚拟节点树
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree

        instance.subTree = subTree // 更新 subTree

        patch(preSubTree, subTree, container, instance, anchor)

      }
    })
  }

  return {
    createApp: createAppApi(render),
  }
}

// export function render(vnode, container) {
//   patch(vnode, container, null)
// }



