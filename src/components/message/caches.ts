export const CACHE_GLOBAL_KEY = 'MESSAGE_STATUS_CACHE'
export interface CacheKeyMap {
  success?: boolean
  error?: boolean
  info?: boolean
  warning?: boolean
  loading?: boolean
}

const defaultCacheStatus: CacheKeyMap = {
  success: false,
  error: false,
  info: false,
  warning: false,
  loading: false,
}

class Caches {
  constructor() {
    window[CACHE_GLOBAL_KEY] = defaultCacheStatus
  }
  getCache(key: keyof CacheKeyMap) {
    return window[CACHE_GLOBAL_KEY][key]
  }
  setCache(key: keyof CacheKeyMap, status: boolean) {
    window[CACHE_GLOBAL_KEY][key] = status
  }
  destory() {
    delete window[CACHE_GLOBAL_KEY]
  }
}

export default Caches
