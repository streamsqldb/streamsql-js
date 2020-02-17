// Type definitions for @streamsql/streamsql-js
// Project: streamsql
// Definitions by: Ethan Marsh <ethan@streamsql.io>
// TypeScript Version: 3.7

/* =================== USAGE ===================
    import streamsql from "@streamsql/streamsql-js";
    streamsql.init(apiKey).sendEvent('mystream', data);
 =============================================== */

interface StreamSQL {
  init(apiKey: string): StreamSQL
  identify(userId: string): StreamSQL
  unidentify(): StreamSQL
  sendEvent(streamName: string, data?: object, onSent?: RequestCallback): void
}

type RequestCallback = (status: number, responseText: string) => any

declare const streamsql: {

  /**
   * Initialize the streamsql client with an API key. This must be done
   * prior to calling any of the other Client methods.
   * 
   * Returns itself so methods may be chained.
   * 
   * @example streamsql.init('0000-0000-0000-0000')
   */
  init(apiKey: string): StreamSQL

  /**
   * Set a custom user id to be sent with events.
   * 
   * The user id persists through multiple sessions.
   * Use `streamsql.unidentify()` to clear an identified user id.
   * 
   * Only one user id is allowed. Calling identify a second time will
   * overwrite the previously set user id.
   * 
   * @example 
   * streamsql.identify('user-123')
   */
  identify(userId: string): StreamSQL

  /**
   * Clears any stored user ids that were set by `streamsql.identify()`.
   * 
   * Unidentifying prior to setting identifying a user has no effect.
   */
  unidentify(): StreamSQL

  /**
   * Send an event (data) to `streamName`. The stream name must be
   * valid and registered prior to sending.
   *
   * `data` is any object that can be stringified. If data is not provided, 
   * default options will still sent, including  page context, any set
   * user properties, timestamps, etc.
   *
   * `onSent` is a an optional callback that is called with
   * the response status code and response text when sending is complete.
   * 
   * @example
   * streamsql.sendEvent('mystream', {name:'name', age:100}, (status, respTxt) => console.log('Sent!'))
   */
  sendEvent(streamName: string, data?: object, onSent?: (status: number, responseText: string) => any): void
}

export = streamsql
 