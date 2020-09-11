## wbd-frontend-kit

> 包含组件、TS 类型定义、hooks、前端脚本等的 React 开发集合

### 组件

1. Message 消息提示组件（完全兼容 antd message 组件）

> 适用场景：每个类型的消息每次只允许展示一个，如果当一个消息提示的显示且并未消失时，其他消息提示默认不展示

使用方式：

```js
import { message } from 'antd'
import messageApi from 'wbd-frontend-kit/dist/components/message'

const singletonMessage = messageApi(message)

singletonMessage.success({ content: 'success' })
```

### Definitions

1. dva-core 类型定义

使用方式：

```js
import { Model } from 'wbd-frontend-kit/dist/definitions/dva-core'
const model: Model = {
  namespace,
  state,
  effects: {
    *xx(_, { call, put }) {
      yield call(xxx)
    },
  },
  reducers: {},
}
```

### Hooks

1. usePagination 用于分页
   使用方式：

```js
import usePagination, {
  useNoRenderPagination,
} from 'wbd-frontend-kit/dist/hooks/usePagination'
// handleChange, handleShowSizeChange, reset 会触发组件更新
const [page, size, handleChange, handleShowSizeChange, reset] = usePagination({
  page: 1,
  size: 10,
})
// setPage不会触发组件更新，适用于手动更新的方式
const [pageOptions, setPage] = useNoRenderPagination({ page: 1, size: 10 })
```

2. useQueryParams 获取查询参数
   使用方式:

```js
import {
  useQueryParam,
  useQueryParams,
} from 'wbd-frontend-kit/dist/hooks/useQueryParams'
// 获取单个参数
const name = useQueryParam(location.search, 'name')
// 获取所有参数
const params = useQueryParams(location.search)
```

3. useToggleState true/false 状态切换
   使用方式:

```js
import useToggleState from 'wbd-frontend-kit/dist/hooks/useToggleState'
const [state, toggleState] = useToggleState(false)
toggleState()
```
