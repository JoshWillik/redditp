class BasicSlide {
  constructor (slide) {
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
  }

  loaded () {
    this.loadingEl.style.display = 'none'
  }

  failed () {
    this.loadingEl.innerHTML = ''
    this.loadingEl.appendChild(this.errorEl)
  }
}
