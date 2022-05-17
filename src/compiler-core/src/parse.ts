import { NodeTypes } from "./ast"

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any[] = []

  let node
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterPolation(context)
  } else if(s[0] === "<") {
    if(/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }

  if(!node) {
    // 如果node没有值，那么就当作text来解析
    node = parseText(context)
  }

  nodes.push(node)

  return nodes
}

function parseText(context: any) {
  const content = parseTextData(context, context.source.length)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context: any, length) {
  // 1.获取当前的内容（content）
  const content = context.source.slice(0, length)

  // 2.删除（推进）
  advanceBy(context, length)
  return content
}

function parseElement(context: any) {
  const element = parseTag(context, TagType.Start) // 删除开始标签，返回对象

  parseTag(context, TagType.End) // 删除结束标签

  return element
}

function parseTag(context: any, type: TagType) {
  // 1.解析 tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 2.删除处理完成的代码
  advanceBy(context, match[0].length) // 删除 <div
  advanceBy(context, 1) // 删除 >

  if(type === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseInterPolation(context) {
  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length
  // const rawContent = context.source.slice(0, rawContentLength)
  const rawContent = parseTextData(context, rawContentLength)

  const content = rawContent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length)


  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXORESSION,
      content: content
    }
  }
}

function createRoot(children) {
  return {
    children
  }
}

function createParserContext(content: string): any {
  return {
    source: content
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

