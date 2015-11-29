class BasicSlide extends EventEmitter {
  constructor (slide) {
    super()
    let el = document.createElement('div')
    el.className = 'slide'

    let spinner = document.createElement('div')
    spinner.className = 'spinner'

    let error = document.createElement('div')
    error.className = 'error-message'
    error.innerHTML = 'X'

    let loadingWrapper = document.createElement('div')
    loadingWrapper.className = 'loading-wrapper'

    loadingWrapper.appendChild(spinner)
    el.appendChild(loadingWrapper)

    this.data = slide

    this.el = el
    this.loadingEl = loadingWrapper
    this.errorEl = error

    if (slide.nsfw && !SETTINGS.get('showNsfw')) {
      this.isNSFW()
    }
  }

  isNSFW () {
    if (this.nsfwOverlay) {
      return
    }

    let nsfwOverlay = document.createElement('div')
    nsfwOverlay.className = 'nsfw'
    nsfwOverlay.innerHTML = 'nsfw'
    nsfwOverlay.addEventListener('click', () => this.el.removeChild(nsfwOverlay))
    this.nsfwOverlay = nsfwOverlay

    this.el.appendChild(nsfwOverlay)
  }

  loaded () {
    this.loadingEl.style.display = 'none'
  }

  failed () {
    this.loadingEl.innerHTML = ''
    this.loadingEl.appendChild(this.errorEl)
  }
}
