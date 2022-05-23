export function emit(instance, event, ...args){ // args：用户传参
  const { props } = instance

  // 首字母大写
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const toHandlerKey = (str: string) => str ? "on" + capitalize(str) : ""

  const handlerName = toHandlerKey(event)
  // const handler = props["on" + capitalize(event)]
  const handler = props[handlerName]

  handler && handler(...args)
}