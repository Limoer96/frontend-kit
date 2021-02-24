import { useState, useRef } from 'react'
import warn from '../utils/warning'
export interface IPagination {
  page: number
  size: number
}

const DEFAULT_OPTIONS: IPagination = {
  page: 1,
  size: 10,
}

export function useNoRenderPagination(
  initPageOptions: IPagination = DEFAULT_OPTIONS
): [IPagination, (pageOptions: IPagination) => void] {
  warn.warning('Deprecated: use `usePagination instead.`')
  const { current } = useRef(initPageOptions)
  function setPagination(pageOptions: IPagination) {
    current.page = pageOptions.page
    if (pageOptions.size) {
      current.size = pageOptions.size
    }
  }
  const pageOptions = current
  return [pageOptions, setPagination]
}

const useLazyRenderPagination = (
  pageOption: IPagination = DEFAULT_OPTIONS
): [number, number, (page: number, size: number) => void, (current: number, size: number) => void, () => void] => {
  const { current } = useRef(pageOption)
  function handleChange(page: number, pageSize: number) {
    current.page = page
    current.size = pageSize
  }
  function handleShowSizeChange(_, size: number) {
    current.page = pageOption.page
    current.size = size
  }
  function reset() {
    handleChange(pageOption.page, pageOption.size)
  }
  return [current.page, current.size, handleChange, handleShowSizeChange, reset]
}

/**
 * 基于 `antd` Pagination组件相关API，对分页器管理的hook
 * @param pageOption
 * @param renderOnChange 更改后是否触发更新
 */
export default function (
  pageOption: IPagination = DEFAULT_OPTIONS,
  renderOnChange = true
): [number, number, (page: number, size: number) => void, (current: number, size: number) => void, () => void] {
  if (!renderOnChange) {
    return useLazyRenderPagination(pageOption)
  }
  const [page, setPage] = useState(pageOption.page)
  const [size, setSize] = useState(pageOption.size)
  function handleChange(page: number, pageSize: number) {
    setPage(page)
    setSize(pageSize)
  }
  function handleShowSizeChange(_, size: number) {
    setPage(pageOption.page) // setSize的时候重置page
    setSize(size)
  }
  function reset() {
    handleChange(pageOption.page, pageOption.size)
  }
  return [page, size, handleChange, handleShowSizeChange, reset]
}
