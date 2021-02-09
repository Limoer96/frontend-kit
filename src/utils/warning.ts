/* eslint-disable no-console */
let warned: Record<string, boolean> = {}

function warning(message: string) {
  if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
    console.error(`Warning: ${message}`)
  }
}

function resetWarned() {
  warned = {}
}

function call(method: (message: string) => void, message: string) {
  if (!warned[message]) {
    method(message)
    warned[message] = true
  }
}

function warningOnce(message: string) {
  call(warning, message)
}

export default { warning, resetWarned, warningOnce }
