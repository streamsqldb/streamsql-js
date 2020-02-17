/**
 * @jest-environment node
 */
import PageContext from '../Page'

describe('Page Context - No Browser', () => {
  it('returns empty strings if window is not available', () => {
    const pageCtx = new PageContext()
    expect(pageCtx.location()).toBe('')
    expect(pageCtx.referrer()).toBe('')
    expect(pageCtx.title()).toBe('')
  })

  it('returns empty strings if document is not available', () => {
    expect(new PageContext().referrer()).toBe('')
    expect(new PageContext().title()).toBe('')
  })
})