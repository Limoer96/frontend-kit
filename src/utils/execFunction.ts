export default function <T = any>(func: (...params: T[]) => any, ...params: T[]) {
  if (typeof func === 'function') {
    return func(...params)
  }
}
