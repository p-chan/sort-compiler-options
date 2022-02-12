import { order } from './order'

type Array = any[]

type Object = {
  [key: string]: any
}

export const sort = (target: any, depth: number) => {
  // array
  if (Array.isArray(target)) {
    const array = target
    const nextArray: Array = []

    array
      .sort((a, b) => {
        if (a < b) return -1
        if (a > b) return 1

        return 0
      })
      .forEach((item) => {
        if (Array.isArray(item) || typeof item === 'object') {
          return sort(item, depth + 1)
        }

        return nextArray.push(item)
      })

    return nextArray
  }

  // object
  if (typeof target === 'object') {
    const object = target
    const nextObject: Object = {}

    Object.keys(object)
      .sort((a, b) => {
        // compilerOptions
        if (depth === 0) {
          let aIndex = order.findIndex((key) => key === a)
          let bIndex = order.findIndex((key) => key === b)

          aIndex = aIndex >= 0 ? aIndex : Number.MAX_SAFE_INTEGER
          bIndex = bIndex >= 0 ? bIndex : Number.MAX_SAFE_INTEGER

          if (aIndex > bIndex) return 1
          if (aIndex < bIndex) return -1

          return 0
        }

        // others
        if (a < b) return -1
        if (a > b) return 1

        return 0
      })
      .forEach((key) => {
        return (nextObject[key] = (() => {
          if (Array.isArray(object[key]) || typeof object[key] === 'object') {
            return sort(object[key], depth + 1)
          }

          return object[key]
        })())
      })

    return nextObject
  }

  // no sortable
  return target
}
