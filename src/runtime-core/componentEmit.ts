import { camelize, toHandlerKey } from "../shared"

export function emit(instance, event, ...args){ // args：用户传参
  const { props } = instance

  const handlerName = toHandlerKey(camelize(event)) // 加入烤串转驼峰方法

  const handler = props[handlerName]

  handler && handler(...args)
}