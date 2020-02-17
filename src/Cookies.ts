import { capitalize } from './utils'

export enum SameSite {
  None = `None`,
  Lax = `Lax`,
  Strict = `Strict`
}

export interface HTTPCookie extends Object {
  name: string
  value: string

  path?: string
  domain?: string
  expires?: string

  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: SameSite
}

export interface CookieHandler {
  setCookie(cookieOpts: HTTPCookie): void
  getCookie(name: string): string
  clearCookie(name: string): void
}

/**
 * General client-side document cookie management.
 * @private
 *
 * @method
 * `setCookie(opts: HTTPCookie)` set a cookie from cookie opts.
 * @method
 * `getCookie(cookieName: string)` returns the value of a set cookie,
 *                                 or an empty string if not set
 * @method
 * `clearCookie(cookieName: string)` clears a set cookie
 */
export default class CookieJar implements CookieHandler {
  private simpleCookies: Map<string, string> = new Map()

  public setCookie(cookieOpts: HTTPCookie): void {
    if (!cookieOpts.maxAge && !cookieOpts.expires) {
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      cookieOpts.expires = oneYearFromNow.toUTCString()
    }
    cookieOpts.secure = true
    cookieOpts.sameSite = SameSite.None
    this.simpleCookies.set(cookieOpts.name, cookieOpts.value)
    document.cookie = this.toCookieString(cookieOpts)
  }

  public getCookie(name: string): string {
    if (this.simpleCookies.has(name)) {
      return this.simpleCookies.get(name)!
    }

    let value = ''
    try {
      const cname = `${name}=`;
      const ca = document.cookie.split(';')
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === ' ') {
          c = c.substring(1)
        }
        if (c.indexOf(cname) === 0) {
          value = c.substring(cname.length, c.length)
          break
        }
      }
      return value
    } catch (e) {
      return value
    }
  }

  public clearCookie(name: string): void {
    this.simpleCookies.delete(name)
    const epoch = new Date()
    epoch.setTime(0)
    this.setCookie({
      name,
      value: '',
      maxAge: 0,
      expires: epoch.toUTCString()
    })
  }

  private toCookieString(cookieOpts: HTTPCookie): string {
    const { name, value } = cookieOpts
    let cstring = [`${name}=${value}`]
    delete cookieOpts.name
    delete cookieOpts.value

    for (const [k, v] of Object.entries(cookieOpts)) {
      if (k === `httpOnly`) {
        cstring.push(`HttpOnly`)
      } else if (k === `sameSite`) {
        cstring.push(`SameSite=${v}`)
      } else if (k === `maxAge`) {
        cstring.push(`MaxAge=${v}`)
      } else if (typeof v === 'boolean' && v) {
        cstring.push(`${capitalize(k)}`)
      } else {
        cstring.push(`${capitalize(k)}=${v}`)
      }
    }

    return cstring.join(`; `)
  }
}
