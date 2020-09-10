import { Dict } from '../definitions'

function omit(obj: Dict, keys: (keyof Dict)[]) {
  const result = {
    ...obj,
  }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

export default omit
