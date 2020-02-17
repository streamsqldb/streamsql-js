import PageContext from '../Page'

describe('Page Context', () => {
  let pageCtx = new PageContext()
  beforeEach(() => { pageCtx = new PageContext() })
  // @ts-ignore
  afterEach(() => { pageCtx = null })

  it('returns the current page location', () => {
    const { defaults } = require('jest-config')
    expect(pageCtx.location()).toMatch(defaults.testURL)
  })

  it('returns the page referrer', () => {
    // set in jest-config.testEnvironmentOptions.referrer
    expect(pageCtx.referrer()).toMatch('https://www.google.com/')
  })

  it('returns the document title', () => {
    window.document.title = 'Home Page'
    pageCtx = new PageContext()
    expect(pageCtx.title()).toBe('Home Page')
    window.document.title = ''
  })
})
