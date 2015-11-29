const MP4_TYPE = 'video/mp4; codecs="mp4v.20.8"'
const WEBM_TYPE = 'video/webm; codecs="vp8, vorbis"'

class GfyCatSlide extends BasicSlide {
  static canHandle (post) {
    return post.domain === 'gfycat.com'
  }

  constructor (slide) {
    slide.url = slide.url.replace('http://', 'https://')
    super(slide)

    let video = document.createElement('video')
    video.muted = true
    video.autoplay = false
    video.style.maxWidth = '100%'
    video.style.maxHeight = '100%'
    video.style.display = 'block'

    this.gfycatData = null
    this._data = null
    this.initialized = false

    this.video = video
  }

  correctUrl (url) {
    return url.replace('http://', 'https://')
  }

  preload () {
    let id = this.data.url.split('/').pop()
    this.gfycatData = $.getJSON(`https://gfycat.com/cajax/get/${id}`).then(data => {
      this._data = data.gfyItem
      if (data.gfyItem.nsfw === "1") {
        this.isNSFW()
      }

      if (this.video.canPlayType) {
        if (this.video.canPlayType(WEBM_TYPE) !== "") {
          return this.correctUrl(data.gfyItem.webmUrl)
        } else if (this.video.canPlayType(MP4_TYPE) != "") {
          return this.correctUrl(data.gfyItem.mp4Url)
        } else {
          return false
        }
      } else {
        return false
      }
    }, () => this.failed())
  }

  initialize () {
    this.initialized = true

    this.gfycatData.then(url => {
      if (url === false) {
        let p = document.createElement('p')
        p.innerHTML = `I can't be bothered to make GIFs work for gfycat. If you need this let me know.<br>Search redditp on Github.`
        this.el.appendChild(p)
        this.loaded()
        return
      } else {
        this.video.src = url
        this.video.addEventListener('canplay', () => this.loaded())
        this.video.addEventListener('error', () => this.failed())
        this.video.addEventListener('click', () => this.video.paused? this.start(): this.stop())
        this.video.addEventListener('ended', () => this.start())
        this.el.appendChild(this.video)
      }
    })
  }

  loaded () {
    super.loaded()
    this.start()
  }

  shown () {
    if (!this.initialized) {
      this.initialize()
    }

    this.start()
  }

  hidden () {
    this.stop()
  }

  start () {
    this.video.play()
  }

  stop () {
    this.video.pause()
  }

  done () {
    let _this = this
    let promise = $.Deferred()

    this.video.addEventListener('ended', function videoEnded () {
      _this.video.removeEventListener('ended', videoEnded)
      promise.resolve()
    })

    return promise.then(() => console.log('finished'))
  }
}
