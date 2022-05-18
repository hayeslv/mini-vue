export * from "./toDisplayString"


export const extend = Object.assign;

export const EMPTY_OBJ = {}

export const isObject = (value) => {
  return value !== null && typeof value === "object";
};

export const isString = (value) => typeof value === 'string'

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
};

export const hasOwn = (value, key) =>
  Object.prototype.hasOwnProperty.call(value, key);

// 烤串转驼峰
export const camelize = (str: string) => str.replace(/-(\w)/g, (_, c: string) => {
  // _：匹配的内容 -(\w)； c：(\w) 的内容
  return c ? c.toUpperCase() : ""
})

// 首字母大写
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const toHandlerKey = (str: string) => str ? "on" + capitalize(str) : ""
