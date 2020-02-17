import {
  isValidAPIKeyFormat,
  isPlainObject,
  streamsqlErr,
  capitalize,
} from '../utils'

describe('utils', () => {
  describe('isValidAPIKey', () => {
    it('returns false for nil keys', () => {
      expect(isValidAPIKeyFormat('')).toBe(false)
    })
    it('returns true for valid formatted api keys', () => {
      const validKey = '0000-0000-0000-0000'
      expect(isValidAPIKeyFormat(validKey)).toBe(true)
    })
  })

  describe('isPlainObject', () => {
    it('returns true if it is a plain object', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject(new Object())).toBe(true)
      expect(isPlainObject({ x: 0, y: [] })).toBe(true)
    })
    it('returns false for non-object types', () => {
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject('string')).toBe(false)
      expect(isPlainObject(new Map())).toBe(false)
      expect(isPlainObject(new Set())).toBe(false)
      expect(isPlainObject(() => {})).toBe(false)
    })
  })

  describe('streamsqlErr', () => {
    it('makes a new streamsql labeled Error with original message', () => {
      const errMsg = 'something went wrong'
      const customErr = streamsqlErr(errMsg)
      expect(customErr).toBeInstanceOf(Error)
      expect(customErr.message).toMatch(/streamsql.*err/i)
      expect(customErr.message).toMatch(errMsg)
    })
  })

  describe('capitalize', () => {
    expect(capitalize('')).toBe('')
    expect(capitalize('expires')).toBe('Expires')
    expect(capitalize('EXPIRES')).toBe('Expires')
    expect(capitalize('nameValue')).toBe('Namevalue')
  })
})
