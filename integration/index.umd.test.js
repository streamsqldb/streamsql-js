const home = SERVER_URL + '/index.html'
const alt = SERVER_URL + '/alt.html'
const templatePage = SERVER_URL + '/template-fns.html'

describe('integration', () => {
  let page
  beforeEach(async () => {
    page = await browser.newPage()
  })
  afterEach(async () => {
    await page.close()
  })

  it('loads the dev server', async () => {
    let isResponseOK
    page.on('response', res => {
      isResponseOK = res.ok()
    })
    await page.goto(home)
    expect(isResponseOK).toBe(true)
  })

  it('sends streamname and timestamp', async () => {
    let postData
    await page.goto(home)
    page.on('request', req => {
      if (req.method() === 'POST') postData = req.postData()
    })
    await page.click('#count-button')
    if (postData) {
      postData = JSON.parse(postData)
    }
    expect(postData.stream).toMatch('clickstream')
    expect(postData.data.timestamp).toBeGreaterThan(15e9)
  }, 10000)

  it('sends page context with url, title, and referrer', async () => {
    let postData
    page.on('request', req => {
      if (req.method() === 'POST') postData = req.postData()
    })
    await page.goto(home)
    await page.click('button#count-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.context).toMatchObject({
      url: await page.url(),
      title: await page.title(),
      referrer: '',
    })
    // visit the other page
    await Promise.all([page.waitForNavigation(), page.click('a')])
    await page.click('button#send-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.context).toMatchObject({
      url: await page.url(),
      title: await page.title(),
      referrer: expect.stringMatching(SERVER_URL),
    })
  }, 15000)

  it('sends api key as x-streamsql-key in req header', async () => {
    let reqHeaders
    page.on('request', req => {
      if (req.method() === 'POST') reqHeaders = req.headers()
    })
    await page.goto(alt, { waitUntil: 'networkidle2' })
    await page.click('button#send-button')
    expect(reqHeaders).toMatchObject({
      'x-streamsql-key': '0000-0000-0000-0000',
    })
  })

  it('sends multiple events with user-defined data', async () => {
    // click the counter, just make sure res ok and increments
    let postData
    page.on('request', req => {
      if (req.method() === 'POST') postData = req.postData()
    })
    await page.goto(home, { waitUntil: 'networkidle2' })
    for (let i = 1; i <= 5; i += 1) {
      await page.click('button#count-button')
      postData = postData && JSON.parse(postData)
      expect(postData.data.count).toEqual(i)
    }
  }, 12000)

  it('calls an onSent callback that logs to console after request', async done => {
    // hit the callback button, should log to console
    page.on('console', msg => {
      expect(msg.text()).toMatch('200')
      done()
    })
    await page.goto(home)
    await page.click('button#callback-button')
  }, 8000)

  it('identifies a user that persists pages and unidentifies a user', async () => {
    // login
    let postData
    page.on('request', req => {
      if (req.method() === 'POST') postData = req.postData()
    })

    const userId = 'user-id'

    // simulate a login that should store id to send w request
    await page.goto(home)
    await page.type('input#user-input', userId)
    await page.click('button#login-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: userId })
    postData = undefined // reset for next page

    // visit the other page, should persist userId
    await Promise.all([page.waitForNavigation(), page.click('a')])
    await page.click('button#send-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: userId })
    postData = undefined

    // do logout, ensure logout sent event does NOT have user id
    await page.click('#logout-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: '' })
    postData = undefined

    // go back and send event from home page, should NOT have user id
    await page.goBack()
    await page.click('#count-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: '' })
  }, 20000)

  it('persists user id when coming back to site', async () => {
    // login
    let postData
    page.on('request', req => {
      if (req.method() === 'POST') postData = req.postData()
    })

    const userId = 'user-id'

    // simulate a login that should store id to send w request
    await page.goto(home)
    await page.type('input#user-input', userId)
    await page.click('button#login-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: userId })
    postData = undefined // reset for next page

    // visit the other page, should persist userId
    // visit an external page
    await page.goto('https://www.google.com')
    await page.goto(alt)
    await page.click('button#send-button')
    postData = postData && JSON.parse(postData)
    expect(postData.data.user).toMatchObject({ id: userId })
  }, 8000)

  it('calls template functions onIdentify and onUnidentify', async () => {
    const userId = 'user-id'
    const responseDivSelector = 'div#identify-response'
    // simulate a login that should store id to send w request
    await page.goto(templatePage)
    await page.type('#input-user-id', userId)
    await page.click('button#login-button')
    const identifyResponse = await page.$(responseDivSelector)
    expect(await identifyResponse.evaluate(node => node.innerText)).toBe(userId);

    await page.click('button#logout-button')
    const unidentifyResponse = await page.$(responseDivSelector)
    expect(await unidentifyResponse.evaluate(node => node.innerText)).toBe('');
  })
})
