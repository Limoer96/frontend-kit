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
 * @param location
 */
export const useQueryParams = (search: string) => {
  if (!search) {
    return {}
  }
  const result = useMemo(() => {
    const params = new URLSearchParams(search)
    const result: Dict = {}
    params.forEach((val, key) => {
      result[key] = val
    })
    return result
  }, [search])
  return result
}
