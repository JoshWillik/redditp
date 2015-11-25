class GyfCatSlide extends BasicSlide {
  static canHandle (post) {
    return post.domain === 'gfycat.com'
  }

  constructor (slide) {
    slide.url = slide.url.replace('http://', 'https://')
    super(slide)

    let img = document.createElement('img')
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.display = 'block'

    this.img = img
  }

  preload () {
    this.img.onload = () => this.loaded()
    this.img.onerror = () => this.failed()
    this.img.dataset.id = this.data.url.split('/').pop()
    this.img.className = 'gfyitem'

    this.el.appendChild(this.img)
  }
}
