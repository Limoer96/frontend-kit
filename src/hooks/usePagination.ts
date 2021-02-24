import { useState, useRef } from 'react'

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

export default function (
  pageOption: IPagination = DEFAULT_OPTIONS
): [number, number, (page: number, size: number) => void, (current: number, size: number) => void, () => void] {
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
