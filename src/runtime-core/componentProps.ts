export function initProps(instance, rawProps){
  // 现在先将没有处理过的 props 赋值给 instance 就可以了
  // 后续还会在这里处理 arrts 等逻辑

  instance.props = rawProps || {}
}