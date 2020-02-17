import { streamsqlErr } from "./utils"

export type RequestCallback = (status: number, responseText: string) => any

export interface Fetcher {
  send(data: object, callback?: RequestCallback): Promise<any>
}

/**
 * XHR request object. Used to send events to streamsql db.
 * @constructor
 * @private
 * 
 * @example
 * const xhr = new XHR('https://domain.com/api', 'MY-API-KEY')
 * xhr.send({...}).then(res => res)
 * 
 * TODO: use this as fallback to navigator.sendBeacon.
 */
class XHR implements Fetcher {
  private xhr: XMLHttpRequest

  public constructor(
    private url: string,
    private apiKey: string,
  ) {
    this.xhr = this.buildRequest(this.url, this.apiKey)
  }

  /**
   * Send an XMLHTTP request with `data` and an optional
   * callback when readystate is DONE(4).
   */
  public send(data: object, callback?: RequestCallback): Promise<any> {
    this.xhr = this.buildRequest(this.url, this.apiKey)
    return new Promise((resolve, reject) => {
      this.xhr.onreadystatechange = function () {
        if (this.readyState === this.DONE) {
          callback && callback(this.status, this.responseText)
          if (this.status >= 200 && this.status < 400) {
            try {
              resolve(this.response)
            } catch (error) {
              reject(error)
            }
          } else if (this.status) {
            try {
              reject(this.response)
            } catch (error) {
              reject(error)
            }
          } else {
            reject(streamsqlErr(`something went wrong sending XMLHttpRequest`))
          }
        }
      }
      try {
        this.xhr.send(JSON.stringify(data))
      } catch (error) {
        reject(error)
      }
    })
  }

  protected buildRequest(url: string, apiKey: string): XMLHttpRequest {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    xhr.setRequestHeader('x-streamsql-key', apiKey)
    xhr.withCredentials = true
    xhr.timeout = 3000
    return xhr
  }
}

export default XHR
