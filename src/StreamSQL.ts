import XHR, { Fetcher, RequestCallback } from './XHR'
import UserIdentifier, { Identifier } from './Identify'
import PageContext, { PageContextProvider } from './Page'
import { streamsqlErr, isValidAPIKeyFormat } from './utils'
import { apiEndpoint, apiVersion } from './config'

export interface CoreAPI {
  init(apiKey: string): CoreAPI
  identify(userId: string): CoreAPI
  unidentify(): CoreAPI
  sendEvent(streamName: string, data?: object, onSent?: RequestCallback): void
}

/**
 * Exposes the StreamSQL core client interface to set api keys, 
 * manage user identification, build event data, and post to event streams.
 * @constructor
 * @public
 * @example streamsql.init('MY-API-KEY').sendEvent('mystream', {...})
 */
export default class StreamSQLClient implements CoreAPI {
  private fetcher: Fetcher | void = undefined
  private identifier: Identifier | void = undefined
  private pageCtx: PageContextProvider | void = undefined

  public init(apiKey: string): StreamSQLClient {
    if (!isValidAPIKeyFormat(apiKey)) {
      throw streamsqlErr(`api key is invalid`)
    }
    this.fetcher = new XHR(apiEndpoint, apiKey)
    this.identifier = new UserIdentifier()
    this.pageCtx = new PageContext()
    return this
  }

  public identify(userId: string): StreamSQLClient {
    if (!this.identifier) this.throwNoInitError()
    this.identifier.setUser(userId)
    this.onIdentify(userId) // call template listener
    return this
  }

  public unidentify(): StreamSQLClient {
    if (!this.identifier) this.throwNoInitError()
    this.identifier.deleteUser()
    this.onUnidentify() // call template listener
    return this
  }

  public sendEvent(streamName: string, data?: object, onSent?: RequestCallback): void {
    if (!this.fetcher) this.throwNoInitError()
    this.fetcher.send(this.buildData(streamName, data), onSent)
      .catch((_) => {
        // TODO: log error internally to streamsql
      })
  }

  protected buildData(streamName: string, data?: object): object {
    if (!this.pageCtx || !this.identifier) {
      this.throwNoInitError()
    }
    const streamsqlData = {
      sentAt: new Date().getTime(),
      apiVersion: this.version(),
      context: {
        language: this.pageCtx.language(),
        referrer: this.pageCtx.referrer(),
        title: this.pageCtx.title(),
        userAgent: this.pageCtx.userAgent(),
        url: this.pageCtx.location(),
      },
      user: {
        id: this.identifier.getUser(),
        // FUTURE: ability to add other user props
      },
    }
    const _data = data
      ? Object.assign({}, streamsqlData, { event: data })
      : streamsqlData
    return {
      stream: streamName.toLowerCase(),
      data: _data
    }
  }

  private throwNoInitError(): never {
    throw streamsqlErr(`api key must be set first: streamsql.init(apiKey)`)
  }

  // For pixel
  private version(): string {
    return apiVersion
  }

  // Template functions. Originally built to allow pixel to listen for events.
  // @ts-ignore
  public onIdentify(userId: string) {}
  public onUnidentify() {}
}
