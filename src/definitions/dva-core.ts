declare module 'dva-core' {
  import {
    Reducer,
    Action,
    AnyAction,
    MiddlewareAPI,
    StoreEnhancer,
    Store,
  } from 'redux'
  import { History } from 'history'
  interface Dispatch<A extends Action = AnyAction> {
    <T extends A>(action: T): Promise<any> | T
  }

  interface ActionFunc {
    (api: MiddlewareAPI<any>): void
  }

  interface ReducerEnhancer {
    (reducer: Reducer<any>): void
  }
  // 修改Action为AnyAction来支持额外参数传入
  export type ReducersMapObject<S = any, A extends Action = AnyAction> = {
    [K in keyof S]: Reducer<S[K], A>
  }

  interface Hooks {
    onError?: (e: Error, dispatch: Dispatch<any>) => void
    onAction?: ActionFunc | ActionFunc[]
    onStateChange?: () => void
    onReducer?: ReducerEnhancer
    onEffect?: () => void
    onHmr?: () => void
    extraReducers?: ReducersMapObject
    extraEnhancers?: StoreEnhancer<any>[]
  }

  type DvaOption = Hooks & {
    namespacePrefixWarning?: boolean
    initialState?: Record<string, any>
    history?: Record<string, any>
  }

  interface EffectsCommandMap {
    put: <A extends AnyAction>(action: A) => any
    call: Function
    select: Function
    take: Function
    cancel: Function
    [key: string]: any
  }

  type Effect = (action: AnyAction, effects: EffectsCommandMap) => void
  type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle'
  type EffectWithType = [Effect, { type: EffectType }]
  type Subscription = (api: SubscriptionAPI, done: Function) => void
  type ReducersMapObjectWithEnhancer = [ReducersMapObject, ReducerEnhancer]

  interface EffectsMapObject {
    [key: string]: Effect | EffectWithType
  }

  interface SubscriptionAPI {
    history: History
    dispatch: Dispatch<any>
  }

  interface SubscriptionsMapObject {
    [key: string]: Subscription
  }

  export interface Model {
    namespace: string
    state?: any
    reducers?: ReducersMapObject | ReducersMapObjectWithEnhancer
    effects?: EffectsMapObject
    subscriptions?: SubscriptionsMapObject
  }

  interface RouterAPI {
    history: History
    app: DvaInstance
  }

  interface Router {
    (api?: RouterAPI): JSX.Element | Record<string, any>
  }
  type HandleActions = (
    handles: any,
    defaultState: Pick<Model, 'state'>
  ) => (state: any, action: AnyAction) => (prev: any, curr: any) => void
  interface Plugin {
    _handleActions: HandleActions
    hooks: Hooks & {
      _handleActions: HandleActions
    }
    use: (plugin: Hooks) => void
    apply: (key: string, defaultHandler: Function) => (...args: any[]) => void
    get: (key: keyof Hooks | '_handleActions') => any
  }

  interface DvaInstance {
    _models: Array<Model>
    _store: Store
    _plugin: Plugin
    use: (hooks: Hooks) => void
    model: (model: Model) => void
    unmodel: (namespace: string) => void
    router: (router: Router) => void
    start: (selector?: HTMLElement | JSX.Element) => any
    [key: string]: any
  }

  export function create(options: DvaOption): DvaInstance
}
