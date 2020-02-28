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

  it('sends normalized stream, numeric timestamp, and apiVersion', () => {
    const streamName = 'MyStream'
    streamsql.init(apiKey)
    // @ts-ignore
    const dataBuilder = jest.spyOn(streamsql, 'buildData')
    streamsql.sendEvent(streamName)
    expect(dataBuilder).toHaveReturnedWith(expect.objectContaining({
      stream: expect.stringMatching(streamName.toLowerCase()),
      data: expect.objectContaining({
        timestamp: expect.any(Number),
        apiVersion: expect.stringMatching(process.env.npm_package_config_apiVersion!)
      })
    }))
  })

  it('sends the set user id field after identifying', () => {
    const userId = 'user-123'
    streamsql.init(apiKey)
    streamsql.identify(userId)
    // @ts-ignore
    const dataBuilder = jest.spyOn(streamsql, 'buildData')
    streamsql.sendEvent('mystream')
    expect(dataBuilder).toHaveReturnedWith(expect.objectContaining({
      data: expect.objectContaining({
        user: expect.objectContaining({
          id: userId
        })
      })
    }))
  })

  it('does not send a user id after unidentifying', () => {
    const userId = 'user-123'
    streamsql.init(apiKey)
    streamsql.identify(userId)
    streamsql.unidentify()
    streamsql.sendEvent('mystream')
    // @ts-ignore
    const dataBuilder = jest.spyOn(streamsql, 'buildData')
    streamsql.sendEvent('mystream')
    expect(dataBuilder).toHaveReturnedWith(expect.objectContaining({
      data: expect.objectContaining({
        user: expect.objectContaining({
          id: ""
        })
      })
    }))
  })

  it('includes page context with requests', () => {
    streamsql.init(apiKey)
    // @ts-ignore
    const dataBuilder = jest.spyOn(streamsql, 'buildData')
    streamsql.sendEvent('mystream')
    expect(dataBuilder).toHaveReturnedWith(expect.objectContaining({
      data: expect.objectContaining({
        context: expect.objectContaining({
          url: expect.any(String),
          title: expect.any(String),
          referrer: expect.any(String),
          language: expect.any(String),
          userAgent: expect.any(String),
        })
      })
    }))
  })

  it('includes the users custom data sending events', () => {
    const customData = { x: 0, y: [1,2,3], z: `z` }
    streamsql.init(apiKey)
    // @ts-ignore
    const dataBuilder = jest.spyOn(streamsql, 'buildData')
    streamsql.sendEvent('mystream', customData)
    expect(dataBuilder).toHaveReturnedWith(expect.objectContaining({
      data: expect.objectContaining({
        event: customData,
      })
    }))
  })

  it('calls the onSent callback after sending xhr', () => {
    const onSent = jest.fn()
    streamsql.init(apiKey)
    xhrMock.post(apiEndpoint, (_, res) => {
      // FIXME: not called
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