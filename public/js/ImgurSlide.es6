class ImgurSlide extends ImageSlide {
  static canHandle (post) {
    let isImgur = post.domain === 'imgur.com'
    let isAlbum = post.url.indexOf('gallery') >= 0 || post.url.indexOf('/a/') >= 0
    let isGifv = post.url.indexOf('.gifv') >=  0

    return isImgur && !isAlbum && !isGifv
  }

  constructor (slide) {
    slide.url = slide.url.replace('imgur.com', 'i.imgur.com') + '.png'
    super(slide)
  }
}
