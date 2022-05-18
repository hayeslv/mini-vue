import { TO_DISPLAY_STRING } from './runtimeHelpers';
import { NodeTypes } from "./ast";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)

  // 1.遍历-深度优先搜索
  traverseNode(root, context)

  // 2.修改 text content
  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]

}

// 稳定的程序执行流程
function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break;
    case NodeTypes.ROOT: 
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
      break
  }

}

function traverseChildren(node: any, context: any) {
  const children = node.children;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    }
  }
  return context;
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

