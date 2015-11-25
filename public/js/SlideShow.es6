class Slideshow {
  constructor ($el, redditp) {
    this.$el = $el
    this.$viewport = $el.find('.viewport')
    this.shortcuts = new ShortCutListener
    this.rp = redditp

    this.slides = []
    this.currentSlideIndex = -1
    this.currentSlide = null
  }

  init () {
    let _this = this

    this.$el.find('.previous-arrow').on('click', () => this.previousSlide())
    this.$el.find('.next-arrow').on('click', () => this.nextSlide())
    this.shortcuts.on('previous', () => this.previousSlide())
    this.shortcuts.on('next', () => this.nextSlide())
    this.$el.find('#fullScreenButton').on('click', () => this.toggleFullScreen())
    this.shortcuts.on('toggle-fullscreen', () => this.toggleFullScreen())

    this.$el.find('.slide-links').on('click', 'a', function (evt) {
      evt.preventDefault()
      _this.showSlide(this.dataset.number)
    })

    this.$el.touchwipe({
      wipeLeft: () => this.nextSlide(),
      wipeRight: () => this.previousSlide(),
      min_move_x: 20,
      min_move_y: 20,
      preventDefaultEvents: false
    })

    this.showSlide(1)
  }

  showSlide (num) {
    if (num < 1) {
      throw new Error('Already hit beginning')
    }

    if (this.currentSlide && this.currentSlide.hidden) {
      this.currentSlide.hidden()
    }

    this.showSpinner()
    this.rp.getPost(num).then(slide => {
      this.hideSpinner()

      if (slide) {
        this.currentSlideIndex = num
        this.currentSlide = slide
        let subreddit = `/r/${slide.data.subreddit}`
        this.rp.setTitle(slide.data.url, subreddit, slide.data.title, slide.data.comments)
        this.$viewport.empty().append(slide.el)
        if (slide.shown) {
          slide.shown()
        }
      } else {
        this.$viewport.empty().append($(`<p>That's all, folks!</p>`).css('color', 'white'))
        this.rp.setTitle(null, null, 'End of subreddit', null)
      }
    })
  }

  nextSlide () {
    this.showSlide(this.currentSlideIndex + 1)
  }

  previousSlide () {
    this.showSlide(this.currentSlideIndex - 1)
  }

  setPageLinks (items) {
    var frag = document.createDocumentFragment()
    items.forEach((slide, i) => {
      let a = document.createElement('a')
      a.dataset.number = i + 1
      a.innerHTML = i + 1
      frag.appendChild(a)
    })
    this.$el.find('.slide-links').empty().append(frag)
  }

  toggleFullScreen () {

  }

  showSpinner () {
    this.$el.find('.loading-spinner').get(0).hidden = false
  }

  hideSpinner () {
    this.$el.find('.loading-spinner').get(0).hidden = true
  }
}
