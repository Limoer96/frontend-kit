import { Dict } from '../definitions'
import { useMemo } from 'react'

/**获取路由参数值 */
export const useQueryParam = (search: string, paramKey: string) => {
  if (!search || !paramKey) {
    return ''
  }
  const value = useMemo(() => {
    const params = new URLSearchParams(search)
    const value = params.get(paramKey)
    return value
  }, [search])
  return value
}
/**
 * 获取所有查询参数
 * @param search search string
 * @param keys selected keys
 */
export const useQueryParams = <T = Dict>(search: string, keys?: string[]): T => {
  if (!search) {
    return {} as T
  }
  const result = useMemo(() => {
    const params = new URLSearchParams(search)
    const result = {} as T
    params.forEach((val, key) => {
      if (typeof keys === 'undefined') {
        result[key] = val
      } else {
        if (keys.includes(key)) {
          result[key] = val
        }
      }
    })
    return result
  }, [search, keys])
  return result
}
