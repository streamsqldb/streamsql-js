export const isValidAPIKeyFormat = (apiKey: string): boolean => {
  // TODO: validate formats once auth finished
  return !!apiKey
}

export const isPlainObject = (value: any): boolean => {
  if (!value) return false
  return value.toString() === '[object Object]'
}

export const streamsqlErr = (msg: string): Error => {
  return new Error(`[StreamSQL] Error: ${msg}`)
}

export const capitalize = (s: string): string => {
  if (!s || !s.length) return s
  return s[0].toUpperCase() + s.slice(1).toLowerCase()
}
