export interface PageContextProvider {
  location(): string
  referrer(): string
  title(): string
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

  protected isWindow(prop: string): boolean {
    return (
      typeof window !== 'undefined'
      && window.hasOwnProperty(prop)
    )
  }

  protected isDocument(): boolean {
    return this.isWindow('document') && typeof document !== 'undefined'
  }
}
