export default function (func: ((...params) => any) | undefined, ...params) {
  if (typeof func === 'function') {
    return func(...params)
  }
}
