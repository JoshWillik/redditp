class ImgurSlide extends BasicSlide {
  static canHandle (post) {
    let isImgur = post.domain === 'imgur.com'
    let isAlbum = post.url.indexOf('gallery') > 0 || post.url.indexOf('/a/') > 0
    let isGifv = post.url.indexOf('.gifv') > 0

    return isImgur && !isAlbum && !isGifv
  }

  constructor (slide) {
    super(slide)

    this.imageUrl = this.data.url.replace('imgur.com', 'i.imgur.com') + '.png'

    let img = document.createElement('img')
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'
    img.style.display = 'block'

    this.el.appendChild(img)
    this.img = img
  }

  preload () {
    this.img.src = this.imageUrl
    this.img.onload = () => this.loaded()
    this.img.onerror = () => this.failed()
  }
}
