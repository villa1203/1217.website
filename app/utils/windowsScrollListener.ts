export const windowsScrollListener = (containerQuerySelector: string) => {
  viewDarkVersionToggleOnScroll(containerQuerySelector)
  scrollDirectionState.setBodyClassname()
}

function viewDarkVersionToggleOnScroll(containerQuerySelector: string) {
  const blocksInPage = document.querySelectorAll(containerQuerySelector)

  const blockForToggleColor = blocksInPage[2]

  const landmarkValue = blockForToggleColor?.getBoundingClientRect().top ?  blockForToggleColor?.getBoundingClientRect().top - window.innerHeight : null

  if( !landmarkValue ) return

  if(landmarkValue < 0) document.body?.classList.add('app-body-drak-view')
  else document.body?.classList.remove('app-body-drak-view')
}


class ScrollDirectionState {

  private _lastScrollY = 0
  private _scrollDirection: 'up' | 'down' = 'up'

  constructor() {
  }

  setBodyClassname() {
    this.setScrollDirection()

    console.log(this._scrollDirection)

    if (this._scrollDirection === 'up') {
      document.body?.classList.add('app-scroll-up')
      document.body?.classList.remove('app-scroll-down')
    } else if (this._scrollDirection === 'down') {
      document.body?.classList.remove('app-scroll-up')
      document.body?.classList.add('app-scroll-down')
    }
  }

  private setScrollDirection() {
    const scrollY = window.scrollY
    this._scrollDirection = scrollY > this._lastScrollY ? 'down' : 'up'
    this._lastScrollY = scrollY
  }
}

const scrollDirectionState = new ScrollDirectionState()
