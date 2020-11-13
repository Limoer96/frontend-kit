interface ModuleMap {
  [key: string]: any;
}

type ModuleArray = any[];

export function importAll(
  ctx: __WebpackModuleApi.RequireContext,
  isArray?: boolean,
  formatkey?: (key: string) => string
): ModuleMap | ModuleArray {
  const result = isArray ? [] : {};
  for (const key of ctx.keys()) {
    const module = ctx(key).default || ctx(key);
    if (isArray) {
      (result as ModuleArray).push(module);
    } else {
      (result as ModuleMap)[genKey(key, formatkey)] = module;
    }
  }
  return result;
}

function genKey(key: string, format?: (key: string) => string) {
  return typeof format === "function"
    ? format(key)
    : key
        .split(/[\.\/]/)
        .filter(Boolean)
        .join("-");
}
