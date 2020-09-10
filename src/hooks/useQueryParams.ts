import { Dict } from '../definitions'
import { useMemo } from 'react'

/**获取路由参数值 */
export const useQueryParam = (location: Location, paramKey: string) => {
  const value = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const value = params.get(paramKey)
    return value
  }, [location.search])
  return value
}
/**
 * 获取所有查询参数
 * @param location
 */
export const useQueryParams = (location: Location) => {
  const result = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const result: Dict = {}
    params.forEach((val, key) => {
      result[key] = val
    })
  }, [location.search])
  return result
}
