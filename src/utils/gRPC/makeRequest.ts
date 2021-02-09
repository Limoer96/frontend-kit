import { capitalizeFirstLetter } from '..'
import warn from '../warning'
export default function makeRequest<T>(Constractor: ObjectConstructor | any, params: { [key: string]: any } = {}): T {
  const req = new Constractor()
  const keys = Object.keys(params)
  for (const key of keys) {
    // object类型的数据
    if (Object.prototype.toString.call(params[key]) === '[object Object]') {
      warn.warning(`"${key}"参数无法直接设置参数，请实例化后再设置！`)
    }
    const func: FunctionConstructor = req[`set${capitalizeFirstLetter(key)}`]
    if (typeof func !== 'function') {
      warn.warning(`创建请求失败: ${key} 参数不存在`)
      throw new Error(`创建请求失败: ${key} 参数不存在`)
    }
    try {
      func.bind(req)(params[key])
    } catch (error) {
      warn.warning(`设置请求参数时失败: ${error}`)
      throw new Error(`设置请求参数时失败: ${error}`)
    }
  }
  return (req as any) as T
}
