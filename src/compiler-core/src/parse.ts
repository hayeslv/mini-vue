import { NodeTypes } from "./ast"

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content)

  return createRoot(parseChildren(context, []))
}

// ancestors：祖先
function parseChildren(context, ancestors) {
  const nodes: any[] = []

  while(!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith("{{")) {
      node = parseInterPolation(context)
    } else if(s[0] === "<") {
      if(/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if(!node) {
      // 如果node没有值，那么就当作text来解析
      node = parseText(context)
    }

    nodes.push(node)
  }
  

  return nodes
}

function isEnd(context, ancestors) {
  // 2. 当遇到结束标签的时候
  const s = context.source

  if(s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if(startsWithEndTagOpen(s, tag)) {
        // 命中
        return true
      }
    }
  }

  // if(parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true;
  // }

  // 1. source有值的时候
  return !context.source
}

function parseText(context: any) {
  let endIndex = context.source.length
  let endTokens = ["<", "{{"]

  for(let i=0; i<endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if(index !== -1 && endIndex > index) { // endIndex > index，说明当前index比我们之前存储的更小（更靠近）
      endIndex = index;
    }
  }

  const content = parseTextData(context, endIndex)

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

function parseElement(context: any, ancestors) {
  const element: any = parseTag(context, TagType.Start) // 删除开始标签，返回对象
  
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  // 判断标签是否一致
  if(startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End) // 删除结束标签
  } else {
    throw new Error(`缺少结束标签:${element.tag}`)
  }

  return element
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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

  advanceBy(context, closeDelimiter.length)


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

