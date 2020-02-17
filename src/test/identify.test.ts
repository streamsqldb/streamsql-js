import Identify from '../Identify'

describe('Identify', () => {
  const originalCookiePropDesc = Object.getOwnPropertyDescriptor(
    window.document,
    'cookie'
  )!
  beforeAll(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: '',
    })
  })
  afterAll(() => {
    Object.defineProperty(window.document, 'cookie', originalCookiePropDesc)
  })

  it('sets and gets user ids', () => {
    const i = new Identify()
    i.setUser('user-123')
    expect(i.getUser()).toBe('user-123')
  })

  it('deletes users', () => {
    const i = new Identify()
    i.setUser('user-123')
    i.deleteUser()
    expect(i.getUser()).toBe('')
  })
})

