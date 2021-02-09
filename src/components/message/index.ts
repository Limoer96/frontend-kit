import React from 'react'
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
export interface CacheKeyMap {
  success?: boolean
  error?: boolean
  info?: boolean
  warning?: boolean
  loading?: boolean
}

type CachesTypes = Record<keyof CacheKeyMap, boolean>

const initCaches: CachesTypes = {
  loading: false,
  success: false,
  error: false,
  info: false,
  warning: false,
}

let caches: CachesTypes = {
  ...initCaches,
}

function resetMessageCache() {
  caches = {
    ...initCaches,
  }
}

function messageApi(message: any) {
  const msgFunc = (function (message: any) {
    return (params: MessageParams) => {
      const type = params.type
      if (!caches[type]) {
        // 设置为占用状态
        caches[type] = true
        message[type]({
          ...omit(params, ['type', 'onClose']),
          onClose: () => {
            caches[type] = false
            executeCallback(params.onClose)
          },
        })
      }
    }
  })(message)
  type MessageParamsWithContent = Partial<MessageParams> | string
  function formatParams(params: MessageParamsWithContent, type: keyof CacheKeyMap): MessageParams {
    if (typeof params === 'string') {
      return {
        content: params,
        type,
      }
    }
    return {
      ...params,
      type,
    }
  }
  const api = {
    error: (params: MessageParamsWithContent) => msgFunc(formatParams(params, 'error')),
    info: (params: MessageParamsWithContent) => msgFunc(formatParams(params, 'info')),
    loading: (params: MessageParamsWithContent) => msgFunc(formatParams(params, 'loading')),
    success: (params: MessageParamsWithContent) => msgFunc(formatParams(params, 'success')),
    warning: (params: MessageParamsWithContent) => msgFunc(formatParams(params, 'warning')),
    reset: resetMessageCache,
  }
  return api
}

export default messageApi
