import React from 'react'
import Cache, { CACHE_GLOBAL_KEY, CacheKeyMap } from './caches'
import executeCallback from '../../utils/execFunction'
import omit from '../../utils/omit'

interface ArgsProps {
  content: React.ReactNode
  duration: number | null
  prefixCls?: string
  onClose?: () => void
  icon?: React.ReactNode
  key?: string | number
  style?: React.CSSProperties
  className?: string
}

export interface MessageParams extends Partial<ArgsProps> {
  type: keyof CacheKeyMap
}

function messageApi(message: any) {
  const msgFunc = (function (message: any) {
    if (window[CACHE_GLOBAL_KEY]) {
      // 如果全局对象上已经存在同名的key，此API失效
      return (params: MessageParams) => {
        const type = params.type
        message[type]({ ...omit(params, ['type']) })
      }
    }
    const caches = new Cache()
    return (params: MessageParams) => {
      const type = params.type
      if (!caches.getCache(type)) {
        // 设置为占用状态
        caches.setCache(type, true)
        message[type]({
          ...omit(params, ['type', 'onClose']),
          onClose: () => {
            caches.setCache(type, false)
            executeCallback(params.onClose)
          },
        })
      }
    }
  })(message)
  const api = {
    error: (params: Partial<MessageParams>) =>
      msgFunc({ ...omit(params, ['type']), type: 'error' }),
    info: (params: Partial<MessageParams>) =>
      msgFunc({ ...omit(params, ['type']), type: 'info' }),
    loading: (params: Partial<MessageParams>) =>
      msgFunc({ ...omit(params, ['type']), type: 'loading' }),
    success: (params: Partial<MessageParams>) =>
      msgFunc({ ...omit(params, ['type']), type: 'success' }),
    warning: (params: Partial<MessageParams>) =>
      msgFunc({ ...omit(params, ['type']), type: 'warning' }),
  }
  return api
}

export default messageApi
