/**
 * 非空数组join with ' '
 * @param arrays 待join的字符串数组
 */
export function notEmptyArrayJoinWith(spliter: string = '', ...arrays: string[]) {
  const blackList = [null, undefined, '']
  return arrays.filter((item) => !blackList.includes(item)).join(spliter)
}

/**
 * 判断某个对象是否不含任何实际可用值
 * @param value 对象
 * @param whiteKeys 顶层对象的白名单key
 */
export function isEmptyValue(value, whiteKeys?: string[]) {
  for (const key of Object.getOwnPropertyNames(value)) {
    if (whiteKeys && whiteKeys.includes(key)) {
      continue
    }
    const item = value[key]
    if (Object.prototype.toString.call(item) === '[object Object]') {
      const itemEmpty = isEmptyValue(item)
      if (!itemEmpty) {
        return false
      }
    } else {
      if (item !== undefined && item !== '') {
        return false
      }
    }
  }
  return true
}

export function capitalizeFirstLetter(words: string) {
  return words.slice(0, 1).toUpperCase() + words.slice(1)
}
