class ImageSlide extends BasicSlide {
  static canHandle (post) {
    return ['png', 'jpg', 'jpeg', 'gif'].indexOf(post.url.split('.').pop()) !== -1
  }

  constructor (slide) {
    super(slide)

    let img = document.createElement('img')
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.display = 'inline'

    this.el.appendChild(img)
    this.img = img

    this.el.addEventListener('click', () => this.toggleZoom())
  }

  preload () {
    this.img.src = this.data.url
    this.img.onload = () => this.loaded()
    this.img.onerror = () => this.failed()
  }

  toggleZoom () {
    this.el.classList.toggle('zoomed')

    if (this.img.style.maxHeight) {
      this.img.style.maxHeight = null
    } else {
      this.img.style.maxHeight = '100%'
    }
  }
}
