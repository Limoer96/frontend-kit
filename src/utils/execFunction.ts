export default function (func: any, ...params) {
  if (typeof func === 'function') {
    return func(...params)
  }
}
