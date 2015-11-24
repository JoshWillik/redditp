class ImageSlide extends BasicSlide {
  static canHandle (post) {
    for (let extension of ['.png', '.jpg', '.jpeg']) {
      if (post.url.indexOf(extension) !== -1) {
        return true
      }
    }
    return false
  }

  constructor (slide) {
    super(slide)

    let img = document.createElement('img')
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.display = 'block'

    this.el.appendChild(img)
    this.img = img
  }

  preload () {
    this.img.src = this.data.url
    this.img.onload = () => this.loaded()
    this.img.onerror = () => this.failed()
  }
}
