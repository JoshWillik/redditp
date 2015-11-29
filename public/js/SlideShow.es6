function wait (seconds) {
  let promise = $.Deferred()

  setTimeout(() => promise.resolve(), seconds * 1000)

  return promise
}

class CancelablePromise {
  constructor (promise) {
    this.promise = promise
    this.shouldContinue = true
  }

  then (fn) {
    this.promise.then(this.wrap(fn))
  }

  wrap (fn) {
    return () => {
      if (this.shouldContinue) {
        return fn()
      }
    }
  }

  cancel () {
    this.shouldContinue = false
  }
}

class Slideshow {
  constructor ($el, redditp, settings) {
    this.$el = $el
    this.$viewport = $el.find('.viewport')
    this.$sidebar = $el.find('.sidebar')

    this.$progress = $el.find('.progress-circle')
    this.progress = this.$progress.get(0).getContext('2d')

    this.shortcuts = new ShortCutListener
    this.rp = redditp
    this.settings = settings

    this.slides = []
    this.currentSlideIndex = -1
    this.currentSlide = null
  }

  init () {
    let _this = this

    this.$el.find('.sidebar-toggle').on('click', () => this.toggleSidebar())
    this.$el.find('.previous-arrow').on('click', () => this.previousSlide())
    this.$el.find('.next-arrow').on('click', () => this.nextSlide())
    this.shortcuts.on('previous', () => this.previousSlide())
    this.shortcuts.on('next', () => this.nextSlide())
    this.$el.find('#fullScreenButton').on('click', () => this.toggleFullScreen())
    this.shortcuts.on('toggle-fullscreen', () => this.toggleFullScreen())

    this.$el.find('.slide-links').on('click', 'a', function (evt) {
      evt.preventDefault()
      _this.showSlide(this.dataset.number)
      _this.toggleSidebar()
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

    this.cancelSlideshowTimeout()

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

      this.startSlideshowTimeout(slide, num + 1)
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

  toggleSidebar () {
    this.$sidebar.toggleClass('active')
    this.$el.find('.sidebar-toggle .fa').toggleClass('fa-bars fa-times')
  }

  showSpinner () {
    this.$el.find('.loading-spinner').get(0).hidden = false
  }

  hideSpinner () {
    this.$el.find('.loading-spinner').get(0).hidden = true
  }

  startSlideshowTimeout (slide, nextSlideNum) {
    if (this.settings.get('autoNext')) {
      let shouldContinue
      let timeout = wait(this.settings.get('autoNextTimeout'))

      if (slide.done) {
        let slideDone = slide.done()
        shouldContinue = $.when(slideDone, timeout)
      } else {
        shouldContinue = timeout
      }

      this.slideProgress = 0
      this.slideProgressInterval = setInterval(
        () => this.setProgress(this.slideProgress++),
        (this.settings.get('autoNextTimeout') * 1000) / 100
      )
      this.nextSlideWaiter = new CancelablePromise(shouldContinue)
      this.nextSlideWaiter.then(() => this.showSlide(nextSlideNum))
    }
  }

  cancelSlideshowTimeout () {
    if (this.nextSlideWaiter) {
      this.setProgress(0)
      clearInterval(this.slideProgressInterval)
      this.nextSlideWaiter.cancel()
    }
  }

  setProgress (num) {
    let offset = -(Math.PI / 2)
    let progress = (Math.PI * 2) * (num / 100)
    this.progress.clearRect(0, 0, 100, 100)
    this.progress.beginPath()
    this.progress.moveTo(50, 50)
    this.progress.arc(50, 50, 50, offset, progress + offset)
    this.progress.lineTo(50, 50)
    this.progress.fillStyle = '#ffffff'
    this.progress.fill()
  }
}
