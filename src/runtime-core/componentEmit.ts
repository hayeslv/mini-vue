export function emit(instance, event, ...args){ // args：用户传参
  const { props } = instance

  // 烤串转驼峰
  const camelize = (str: string) => str.replace(/-(\w)/g, (_, c: string) => {
    // _：匹配的内容 -(\w)； c：(\w) 的内容
    return c ? c.toUpperCase() : ""
  })

  // 首字母大写
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const toHandlerKey = (str: string) => str ? "on" + capitalize(str) : ""

  const handlerName = toHandlerKey(camelize(event)) // 加入烤串转驼峰方法
  
  const handler = props[handlerName]

  handler && handler(...args)
}