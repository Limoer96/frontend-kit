import { useState, useRef } from 'react'

export interface IPagination {
  page: number
  size: number
}

const defaultPageOptions: IPagination = {
  page: 1,
  size: 10,
}

type returned = [IPagination, (pageOptions: IPagination) => void]

export function useNoRenderPagination(
  initPageOptions: IPagination = defaultPageOptions
): returned {
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

type returnedv2 = [
  number,
  number,
  (page: number, size: number) => void,
  (current: number, size: number) => void,
  () => void
]

export default function (
  pageOption: IPagination = defaultPageOptions
): returnedv2 {
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
