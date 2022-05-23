export * from "./ShapeFlags"




export const extend = Object.assign

export const isObject = (value) => {
  return value !== null && typeof value === "object"
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue)
}

export const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);