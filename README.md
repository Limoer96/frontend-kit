## wbd-frontend-kit

> 包含组件、TS 类型定义、hooks、前端脚本等的 React 开发集合

### 组件

1. Message 消息提示组件（完全兼容 antd message 组件）

> 适用场景：每个类型的消息每次只允许展示一个，如果当一个消息提示的显示且并未消失时，其他消息提示默认不展示

使用方式：

```js
import { message } from 'antd'
import { messageApi } from 'wbd-frontend-kit'

const singletonMessage = messageApi(message)

singletonMessage.success({ content: 'success' })
singletonMessage.info('info')
singletonMessage.reset()
singletonMessage.error('error happend!')
```

### Definitions

1. dva-core 类型定义

使用方式：

```js
import { Model } from 'wbd-frontend-kit'
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
import { usePagination, useNoRenderPagination } from 'wbd-frontend-kit'
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
import { useQueryParam, useQueryParams } from 'wbd-frontend-kit'
// 获取单个参数
const name = useQueryParam(location.search, 'name')
// 获取所有参数
const params = useQueryParams(location.search)
```

3. useToggleState true/false 状态切换
   使用方式:

```js
import { useToggleState } from 'wbd-frontend-kit'
const [state, toggleState] = useToggleState(false)
toggleState()
```

### 工具函数

1. `execFunction(func, ...params)`用于执行函数的函数，常用于执行`callback`

```js
import { execFunction } from 'wbd-frontend-kit'
execFunction(func)
```

2. `exportFile(url, params)`下载远程文件

```js
import { exportFile } from 'wbd-frontend-kit'
const sendData = { Authorization: this.state.Authorization, type: 'all' }
exportFile('/api/admin/platform/downloadReceiptProfitTemplate.xls', sendData)
```

3. `importAll(ctx: __WebpackModuleApi.RequireContext, isArray?: boolean, formatkey?: (key: string) => string)` 批量导出模块

`importAll`函数用于批量导出模块，`ctx`函数为`require.context`的`context`实例，`isArray`表示导出类型是否是数组，`formatKey`表示在导出为对象的情况下，自定义`key`。

> `importAll`函数依赖`require.context`，详情见[require.context](https://webpack.js.org/guides/dependency-management/#requirecontext)的使用。注意：本函数只在使用`Webpack`构建的项目中生效。

例如如果要导出`pages/`目录下所有的`model.ts`，可以是如下的写法：

```js
import { importAll } from 'wbd-frontend-kit'
// 1. 导出为对象，使用默认的key生成规则
export default importAll(require.context('./pages/', true, /.*model\.ts$/))
// 2. 导出为对象，使用自定义key规则（加上前缀）
export default importAll(require.context('./pages/', true, /.*model\.ts$/), false, (key) => `prefix-${key}`)
// 3. 导出为数组
export default importAll(require.context('./pages/', true, /.*model\.ts$/), true)
```

4. `warning(content)`, `warningOnce(content)`开发模式下控制台警告

```js
import { warn } from 'wbd-frontend-kit
warn.warning('warning there')
warn.warningOnce('warning once')
warn.resetWarned()
warn.warningOnce('warning once')
```

其余工具函数见`es/utils`

### 脚本

> 本项目包含的所有脚本均可以通过`wbd-scripts [command] [<params>]`的方式运行，全局安装`yarn global add wbd-frontend-kit`后直接使用该命令或本地安装后在`package.json`中的`scripts`对象中添加`{"commandxx": "wbd-scripts"}`，然后使用通过`yarn commandxx commandName`的运行脚本。

```bash
Usage: wbd-scripts [command] [<params>]

  [command]
    将要运行的命令名称，例如 wbd-scripts module
  <params>
    该命令需要的参数（可选），例如：wbd-scripts init ts dva 表示初始化时使用ts和dva
```

> 支持的命令

1. module: `yarn wbd-scripts module`
   使用该命令创建一个新的模块，该模块包含了`pages/routes/models`三个部分。第一次运行命令会生成配置文件模板，修改模板后第二次运行本命令可生成一个新的模块。注：该命令生成的模块只适用于`b2b`模板的项目。
   > 注意：1.0.7 版本后只支持`web-templates`模板，使用`b2b`模板的项目请使用 1.0.6 及以下版本
