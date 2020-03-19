import CookieHandler from '../Cookies'

describe('CookieHandler', () => {
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

  let ch = new CookieHandler()
  beforeEach(() => { ch = new CookieHandler() })
  // @ts-ignore
  afterEach(() => { ch = null })

  it('sets a formatted cookie strings', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    expect(document.cookie).toMatch(/name=value; Expires=.*GMT/)
  })

  it('gets set cookie values from both memory and browser', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    expect(ch.getCookie('name')).toBe('value')
    // @ts-ignore
    ch.simpleCookies.delete('name') // delete cookie in memory
    expect(ch.getCookie('name')).toBe('value')
  })

  it('returns an empty string for nonexistent cookies', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    expect(ch.getCookie('notname')).toBe('')
  })

  it('sets maxAge to 0 to clear cookies', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    ch.clearCookie('name')
    expect(document.cookie).toMatch('MaxAge=0')
  })

  it('sets boolean values with keys only', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
      secure: true,
      httpOnly: true,
    })
    expect(document.cookie).toMatch(/Secure[^=]/)
    expect(document.cookie).toMatch(/HttpOnly[^=]/)
  })

  it('sets same site to none and secure to true', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    expect(document.cookie).toMatch('SameSite=None')
    expect(document.cookie).toMatch('Secure')
  })

  it('sets default cookie path to /', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
    })
    expect(document.cookie).toMatch('Path=/')
  })

  it('overrides default domain and path when set in options', () => {
    ch.setCookie({
      name: 'name',
      value: 'value',
      domain: '.domain.me',
      path: '/mypath'
    })
    expect(document.cookie).toMatch('Domain=.domain.me')
    expect(document.cookie).toMatch('Path=/mypath')
  })

  it('catches and returns empty string if no doc.cookie', () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: undefined,
    })
    expect(ch.getCookie('name')).toBe('')
  })
})
