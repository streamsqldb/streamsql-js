import CookieHandler from './Cookies'
import { USER_COOKIE_KEY } from './constants'

export interface Identifier {
  setUser(userId: string): void
  getUser(): string
  deleteUser(): void
}

/**
 * Manages setting, persisting and clearing application-defined user ids.
 * @constructor
 * @private
 * 
 * @method `setUser(userId: string)` set a userId to be sent with future events
 * @method `getUser()` get the current userId if set
 * @method `deleteUser()` clear any userId for future events (logout)
 */
export default class UserIdentifier implements Identifier {
  private userId = ''
  private ch = new CookieHandler()

  public setUser(userId: string): void {
    this.userId = userId
    this.ch.setCookie({
      name: USER_COOKIE_KEY,
      value: userId
    })
  }

  public getUser(): string {
    return this.userId || this.ch.getCookie(USER_COOKIE_KEY)
  }

  public deleteUser(): void {
    this.userId = ''
    this.ch.clearCookie(USER_COOKIE_KEY)
  }
}
