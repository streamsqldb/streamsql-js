import xhrMock from 'xhr-mock'
import StreamSQL from '../StreamSQL'
import { apiEndpoint } from '../config'

describe('StreamSQL Core', () => {
  const apiKey = '0000-0000-0000-0000'
  let streamsql = new StreamSQL()

  beforeEach(() => {
    streamsql = new StreamSQL()
    xhrMock.setup()
    xhrMock.post(apiEndpoint, {status: 200})
  })
  afterEach(() => {
    // @ts-ignore
    streamsql = null
    xhrMock.teardown()
  })

  it('instantiates', () => {
    expect(streamsql).toBeTruthy()
  })

  it('throws with invalid apikey format', () => {
    expect(() => streamsql.init('')).toThrow(/api.*key/i)
  })

  it('throws calling other methods before init', () => {
    const errRegex = /init.*api.*key/i
    expect(() => streamsql.identify('')).toThrow(errRegex)
    expect(() => streamsql.unidentify()).toThrow(errRegex)
    expect(() => streamsql.sendEvent('stream', {})).toThrow(errRegex)
  })

  it('initializes via init(apiKey)', () => {
    expect(() => streamsql.init(apiKey)).not.toThrow()
    expect(streamsql.init(apiKey)).toBeInstanceOf(StreamSQL)
  })

  it('sends default fields streamName and timestamp', () => {
    const streamName = 'mystream'
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.body()).toMatchObject({
        streamName,
        eventTimestamp: expect.any(Number),
      })
      return res.status(200)
    })
    streamsql.sendEvent(streamName)
  })

  it('sends the set user id field after identifying', () => {
    const userId = 'user-123'
    streamsql.init(apiKey)
    streamsql.identify(userId)
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.body()).toMatchObject({
        user: { id: userId },
      })
      return res.status(200)
    })
    streamsql.sendEvent('mystream')
  })

  it('does not send a user id after unidentifying', () => {
    const userId = 'user-123'
    streamsql.init(apiKey)
    streamsql.identify(userId)
    streamsql.unidentify()
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.body()).toMatchObject({
        user: { id: '' }
      })
      return res.status(200)
    })
    streamsql.sendEvent('mystream')
  })

  it('includes page context with requests', () => {
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.body()).toMatchObject({
        context: expect.objectContaining({
          url: expect.any(String),
          location: expect.any(String),
          referrer: expect.any(String),
        })
      })
      return res.status(200)
    })
    streamsql.sendEvent('mystream')
  })

  it('includes the users custom data sending events', () => {
    const customData = { x: 0, y: [1,2,3], z: `z` }
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.body()).toMatchObject({
        data: customData,
      })
      return res.status(200)
    })
    streamsql.sendEvent('mystream', customData)
  })

  it('sends x-streamsql-key with clients apiKey request headers', () => {
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (req, res) => {
      expect(req.headers()).toMatchObject({
        'x-streamsql-key': apiKey,
      })
      return res.status(200)
    })
    streamsql.sendEvent('mystream', {})
  })

  it('calls the onSent callback after sending xhr', () => {
    const onSent = jest.fn()
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (_, res) => {
      expect(onSent).toHaveBeenCalledTimes(1)
      return res.status(200)
    })
    streamsql.sendEvent('mystream', {}, onSent)
  })

  it('catches request errors', () => {
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (_, res) => {
      return res.status(500)
    })
    expect(() => streamsql.sendEvent('mystream')).not.toThrow()
  })

  it('calls template listeners for identify, unidentify', () => {
    streamsql.init(apiKey)
    const onIdentify = jest.fn((userId: string) => userId)
    const onUnidentify = jest.fn()

    streamsql.onIdentify = onIdentify
    streamsql.onUnidentify = onUnidentify

    streamsql.identify('user-id')
    expect(onIdentify).toHaveBeenCalledTimes(1)
    expect(onIdentify).toHaveBeenCalledWith('user-id')

    streamsql.unidentify()
    expect(onUnidentify).toHaveBeenCalledTimes(1)
  })
})