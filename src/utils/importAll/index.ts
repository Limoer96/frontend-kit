interface ModuleMap {
  [key: string]: any
}

type ModuleArray = any[]

/**
 * webpack构建体系下的批量导入
 * @param ctx
 * @param isArray 是否导出成数组（默认为对象）
 * @param formatkey 到处成对象时，自定义生成key
 */
export function importAll(
  ctx: __WebpackModuleApi.RequireContext,
  isArray?: boolean,
  formatkey?: (key: string) => string
): ModuleMap | ModuleArray {
  const result = isArray ? [] : {}
  for (const key of ctx.keys()) {
    const module = ctx(key).default || ctx(key)
    if (isArray) {
      ;(result as ModuleArray).push(module)
    } else {
      ;(result as ModuleMap)[genKey(key, formatkey)] = module
    }
  }
  return result
}

function genKey(key: string, format?: (key: string) => string) {
  return typeof format === 'function'
    ? format(key)
    : key
        .split(/[\.\/]/)
        .filter(Boolean)
        .join('-')
}
