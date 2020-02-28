export interface PageContextProvider {
  referrer(): string
  title(): string
  language(): string
  userAgent(): string
  location(): string // url
}

export default class PageContext implements PageContextProvider {
  public location(): string {
    if (this.isWindow('location')) {
      return window.location.href || ''
    }
    return ''
  }

  public referrer(): string {
    if (this.isDocument()) {
      return document.referrer || ''
    }
    return ''
  }

  public title(): string {
    if (this.isDocument()) {
      return document.title || ''
    }
    return ''
  }

  public language(): string {
    if (this.isNavigator()) {
      return navigator.language || ''
    }
    return ''
  }

  public userAgent(): string {
    if (this.isNavigator()) {
      return navigator.userAgent || ''
    }
    return ''
  }

  protected isWindow(prop: string): boolean {
    return (
      typeof window !== 'undefined'
      && window.hasOwnProperty(prop)
    )
  }

  protected isDocument(): boolean {
    return this.isWindow('document') && typeof document !== 'undefined'
  }

  protected isNavigator(): boolean {
    return this.isWindow('navigator') && typeof navigator !== 'undefined'
  }
}
