import { effect } from '../reactivity/effect';
import { EMPTY_OBJ, isObject, ShapeFlags } from './../shared';
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from './createApp';
import { Fragment, Text } from './vnode';

export function createRenderer(options){
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null);
  }
  
  // n1 代表老的虚拟节点
  // n2 代表新的虚拟节点
  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2
  
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default: // 不是特殊的类型，继续走之前的逻辑
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 处理元素
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }
  
  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }
  
  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = n2.el = document.createTextNode(children)
    container.append(textNode)
  }
  
  function processComponent(n1, n2, container, parentComponent) {
    // 挂载组件
    mountComponent(n2, container, parentComponent)
    // TODO 更新组件
  }
  
  function processElement(n1, n2, container, parentComponent) {
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log('patchElement');
    // 更新对比
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = n2.el = n1.el // n1.el是初始化得到的，赋值给n2.el可以保证下次调用时（更新）可以拿到正确的 el

    patchChildren(n1, n2, el)
    patchProps(el, oldProps, newProps)

  }

  function patchChildren(n1, n2, container) {
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children

    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新节点是 text
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 老节点是 array
        // 1.把老的 children 清空
        unmountChildren(n1.children)
        // 2.设置 text
        hostSetElementText(container, c2)
      } else { // 老节点是 text
        if(c1 !== c2) {
          hostSetElementText(container, c2)
        }
      }
    }
  }

  function unmountChildren(children) {
    for(let i=0; i<children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if(oldProps !== newProps) {
      // 循环新的Props
      for (const key in newProps) { 
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if(prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      if(oldProps !== EMPTY_OBJ){
        // 循环老的Props
        for (const key in oldProps) { 
          if(!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }
  
  
  function mountComponent(initialVNode: any, container: any, parentComponent) {
    // 抽离出 instance 实例，表示组件实例
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 安装component
    setupComponent(instance)
    // 安装render
    setupRenderEffect(instance, container)
  }
  
  function mountElement(vnode, container, parentComponent) {
    // 新建节点--替换为稳定的接口
    const el = vnode.el = hostCreateElement(vnode.type)
    const { props, children, shapeFlag } = vnode
  
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // children 中每个都是 vnode，需要继续调用 patch，来判断是element类型还是component类型，并对其初始化
      mountChildren(vnode, el, parentComponent)
    }
  
    // props
    for (const key in props) {
      const value = props[key]
      // 添加属性--替换为稳定的接口
      hostPatchProp(el, key, null, value)
    }
  
    // 添加到视图--替换为稳定的接口
    hostInsert(el, container)
  }
  
  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(v => patch(null, v, container, parentComponent))
  }
  
  function setupRenderEffect(instance, container) {
    effect(() => {
      if(!instance.isMounted) {
        const { proxy, vnode } = instance
        // 获取render函数的返回值（返回的是组件render的虚拟节点树）
        const subTree = instance.subTree = instance.render.call(proxy)
        // 基于返回的虚拟节点，对其进行patch比对（打补丁）
        patch(null, subTree, container, instance)
      
        // 此处可以确定所有的 element 都被 mount 了
        vnode.el = subTree.el

        instance.isMounted = true
      } else {
        console.log("update");
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        // 更新
        patch(prevSubTree, subTree, container, instance)
      }
      
    })
  }

  return {
    createApp: createAppApi(render)
  }
}




