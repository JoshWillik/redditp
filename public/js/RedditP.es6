/*
  Author: Yuval Greenfield (http://uberpython.wordpress.com)

  Favicon by Double-J designs http://www.iconfinder.com/icondetails/68600/64/_icon
  HTML based on http://demo.marcofolio.net/fullscreen_image_slider/
  Author of slideshow base :      Marco Kuiper (http://www.marcofolio.net/)
*/

;(function(){

const GOOD_PATH_REGEX = /r\/.+/
const BASE_URL = 'https://www.reddit.com'

const ANIMATION_SPEED = 1000
const timeToNextSlide = 6 * 1000
const COOKIE_DAYS = 300

const exitFullscreen = document.exitFullscreen
  || document.msExitFullscreen
  || document.mozCancelFullScreen
  || document.webkitExitFullscreen

const goFullscreen = el => {
  let fn = elem.requestFullscreen
    || elem.msRequestFullscreen
    || elem.mozRequestFullScreen
    || elem.webkitRequestFullscreen

  if (fn === elem.webkitRequestFullscreen) {
    fn.call(el, Element.ALLOW_KEYBOARD_INPUT)
  } else {
    fn.call(el)
  }
}

/*
 * The standard jQuery deferred seems to not play nicely with proper Promises.
 * Becase of this, I am converting what would normally be Promise.resolve
 * into something jQuery can understand
 */
let jResolve = value => {
  let p = $.Deferred()
  p.resolve(value)
  return p
}

class RedditP {
  constructor ($el) {
    this.$el = $el
    this.plugins = []
    this.posts = []
    this._fetchedPosts = []

    this.subredditDataUrl = null
    this.nextPageToken = 'start'

    this.pageLoaders = {}
  }

  init () {
    this.setTitle('', '', 'Loading Reddit Slideshow', '')

    this.slideshow = new Slideshow(this.$el.find('.slideshow-container'), this)
  }

  registerPlugin (Plugin) {
    this.plugins.push(Plugin)
  }

  bestHandler (post) {
    for (let Plugin of this.plugins) {
      if (Plugin.canHandle(post)) {
        return new Plugin(post)
      }
    }
    return false
  }

  loadSubreddit (sub) {
    let name = sub === '/'? 'Homepage': sub
    let subredditUrl = BASE_URL + sub
    this.subredditDataUrl = BASE_URL + sub + ".json"
    this.slideshow.init()
  }

  getPost (number) {
    let index = number - 1

    // If we are within 2 slides of the end of the currently loaded set,
    // we should be fetching some more to reduce wait time
    if (index + 2 >= this.posts.length) {
      setTimeout(() => this.loadPosts(this.subredditDataUrl, this.nextPageToken), 0)
    }

    if (index >= this.posts.length) {
      return this.loadPosts(this.subredditDataUrl, this.nextPageToken)
        .then(() => this.getPost(number), err => console.log('LOADING ERROR', err))
    }

    return jResolve(this.posts[index])
  }

  loadPosts (url, after) {
    let key = after
    if (!key) {
      this.posts.push(false)
      return jResolve([false])
    }

    if (this.pageLoaders[key]) {
      return this.pageLoaders[key]
    }

    let loader = this.fetchPosts(url, after).then(posts => {
      return posts
        .map(post => {
          post.url = post.url.replace('http://', 'https://')
          return post
        })
        .map(post => this.bestHandler(post))
        .filter(post => post !== false)
        .map(post => {
          if (post.preload) post.preload()
          return post
        })
    }).then(posts => {
      posts.forEach(post => this.posts.push(post))
      this.slideshow.setPageLinks(this.posts)
    })

    this.pageLoaders[key] = loader

    return loader
  }

  fetchPosts (url, after) {
    let params = {}
    if (after) {
      params.after = after
    }

    return $.getJSON(url, params).then(res => {
      this._fetchedPosts.push(res)
      this.nextPageToken = res.data.after
      return res.data.children.map(item => {
        return {
          id: item.data.id,
          title: item.data.title,
          subreddit: item.data.subreddit,
          nsfw: item.data.over_18,
          comments: BASE_URL + item.data.permalink,
          domain: item.data.domain,
          url: item.data.url,
        }
      })
    })
  }

  setTitle (postUrl, subreddit, name, commentsUrl) {
    this.$el.find('.slide-title').text(name).attr('title', name)
    this.$el.find('.active-slide-link').attr('href', postUrl || '')
    this.$el.find('.active-slide-comments').attr('href', commentsUrl || '')
    this.$el.find('.subreddit')
      .attr('href', BASE_URL + subreddit || '')
      .text(subreddit || '')
    document.title = `${name} | redditP`
  }
}

$(function(){
  let rp = new RedditP($(document.body))
  rp.init()

  rp.registerPlugin(ImageSlide)
  rp.registerPlugin(ImgurSlide)
  rp.registerPlugin(ImgurAlbumSlide)
  rp.registerPlugin(YoutubeSlide)
  rp.registerPlugin(GfyCatSlide)

  rp.loadSubreddit(window.location.pathname)

  window.rp = rp
})

})()

$(function () {
    function open_in_background(selector){
        // as per https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent
        // works on latest chrome, safari and opera
        var link = $(selector)[0];

        // Simulating a ctrl key won't trigger a background tab on IE and Firefox ( https://bugzilla.mozilla.org/show_bug.cgi?id=812202 )
        // so we need to open a new window
        if ( navigator.userAgent.match(/msie/i) || navigator.userAgent.match(/trident/i)  || navigator.userAgent.match(/firefox/i) ){
            window.open(link.href,'_blank');
        } else {
            var mev = document.createEvent("MouseEvents");
            mev.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, true, 0, null);
            link.dispatchEvent(mev);
        }
    }
})
