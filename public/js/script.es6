/*
  Author: Yuval Greenfield (http://uberpython.wordpress.com)
  Rebuild: Josh Vanderwillik

  Favicon by Double-J designs http://www.iconfinder.com/icondetails/68600/64/_icon
  HTML based on http://demo.marcofolio.net/fullscreen_image_slider/
  Author of slideshow base :      Marco Kuiper (http://www.marcofolio.net/)
*/

;(function(){
const APPLICATION_ID = 'f2edd1ef8e66eaf'
const GOOD_PATH_REGEX = /r\/.+/
const BASE_URL = 'https://www.reddit.com'

const ANIMATION_SPEED = 1000
const timeToNextSlide = 6 * 1000
const COOKIE_DAYS = 300

const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_UP = 38
const KEY_DOWN = 40
const KEY_ONE = 49
const KEY_NINE = 57
const KEY_SPACE = 32
const KEY_PAGE_UP = 33
const KEY_PAGE_DOWN = 34
const KEY_ENTER = 13
const KEY_A = 65
const KEY_C = 67
const KEY_F = 70
const KEY_I = 73
const KEY_R = 82
const KEY_T = 84

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

class Slideshow {

}

class CollapseBox {
  constructor ($el) {
    this.$el = $el
  }
  init () {
    this.$el.on('click', '.collapser', () => this.toggle())
  }
  toggle () {
    let state = this.$el.data('openstate');
    let $collapse = this.$el.find('.collapser')
    if (state == "open") {
        $collapse.text("+")
        var arrowLeftPosition = $collapse.position().left
        this.$el
          .animate({left: `-${arrowLeftPosition}px`})
          .data('openstate', "closed");
    } else {
        $collapse.text("-");
        this.$el
          .animate({left: "0px"})
          .data('openstate', "open");
    }
}}

class ShortCutListener extends EventEmitter {
  constructor () {
    super()
    this.start()
  }

  start () {
    $(document).on('keyup.shortcutlistener', e => {
      // The control key is most likely used for non redditp things
      if(e.ctrlKey) return
      switch (e.keyCode) {
          case KEY_C: return this.emit('toggle-controls')
          case KEY_T: return this.emit('toggle-title')
          case KEY_A: return this.emit('toggle-auto')
          case KEY_I: return this.emit('open-in-background')
          case KEY_R: return this.emit('open-comments-in-background')
          case KEY_F: return this.emit('toggle-fullscreen')
          case KEY_PAGE_UP: //fall through
          case KEY_LEFT: //fall through
          case KEY_UP: return this.emit('previous')
          case KEY_PAGE_DOWN:
          case KEY_RIGHT:
          case KEY_DOWN:
          case KEY_SPACE: return this.emit('next')
      }
    })
  }

  stop () {
    $(document).off('.shortcutlistener')
  }
}

class RedditP {
  constructor ($el) {
    this.$el = $el
    this.shortcuts = new ShortCutListener
  }

  init () {
    this.setTitle(null, 'Loading Reddit Slideshow', 'Loading Reddit Slideshow')

    this.$el.find('.previous-button').on('click', () => this.previousSlide())
    this.$el.find('.next-button').on('click', () => this.nextSlide())
    this.shortcuts.on('previous', () => this.previousSlide())
    this.shortcuts.on('next', () => this.nextSlide())

    this.$el.find('#fullScreenButton').on('click', () => this.toggleFullScreen())
    this.shortcuts.on('toggle-fullscreen', () => this.toggleFullScreen())

    this.shortcuts.start()

    this.$el.find(".slideshow-container").touchwipe({
      wipeLeft: this.nextSlide.bind(this),
      wipeRight: this.previousSlide.bind(this),
      min_move_x: 20,
      min_move_y: 20,
      preventDefaultEvents: false
    })

    this.controlsBox = new CollapseBox(this.$el.find('.controls'))
    this.titleBox = new CollapseBox(this.$el.find('.title-box'))

    this.controlsBox.init()
    this.titleBox.init()

    this.slideshow = new Slideshow(this.$el.find('.slideshow-container'))
  }

  toggleFullScreen () {

  }

  nextSlide () {

  }

  previousSlide () {

  }

  showSlide (slide) {
    let subredditUrl = `/r/${slide.subreddit}`
    this.setTitle(slide.url, subredditUrl, slide.title)
  }

  loadSubreddit (sub) {
    let name = sub === '/'? 'Homepage': sub
    let subredditUrl = BASE_URL + sub
    this.fetchImages(sub).then(images => {
      console.log(images)
      this.showSlide(images[0])
    }, err => {
      console.log(err)
    })
  }

  fetchImages (sub) {
    let url = BASE_URL + sub + ".json"
    return $.getJSON(url).then(res => {
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

  setTitle (url, subreddit, name) {
    this.$el.find('.slide-title').text(name)
    this.$el.find('.active-slide-permalink').attr('href', url)
    this.$el.find('.subreddit-url')
      .attr('href', BASE_URL + subreddit)
      .text(subreddit)
    document.title = `${name} | redditP`
  }
}

$(function(){
  let rp = new RedditP($('#page'))
  rp.init()

  rp.registerPlugin(ImgurSlide)
  rp.registerPlugin(ImgurAlbumSlide)
  rp.registerPlugin(YoutubeSlide)
  rp.registerPlugin(GyfCatSlide)

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
    var addImageSlide = function (pic) {
        pic.isVideo = false;
        if (pic.url.indexOf('gfycat.com') >= 0){
            pic.isVideo = true;
        } else if (isImageExtension(pic.url)) {
            // simple image
        } else {
            var betterUrl = tryConvertUrl(pic.url);
            if(betterUrl !== '') {
                pic.url = betterUrl;
            } else {
                if (rp.debug) {
                    console.log('failed: ' + pic.url);
                }
                return;
            }
        }

        rp.foundOneImage = true;

        preLoadImages(pic.url);
        rp.photos.push(pic);

        var i = rp.photos.length - 1;
        var numberButton = $("<a />").html(i + 1)
            .data("index", i)
            .attr("title", rp.photos[i].title)
            .attr("id", "numberButton" + (i + 1));
        if(pic.over18) {
            numberButton.addClass("over18");
        }
        numberButton.click(function () {
            showImage($(this));
        });
        numberButton.addClass("numberButton");
        addNumberButton(numberButton);
    };
    //
    // Shows an image and plays the animation
    //
    var showImage = function (docElem) {
        // Retrieve the index we need to use
        var imageIndex = docElem.data("index");

        startAnimation(imageIndex);
    };

    var isLastImage = function(imageIndex) {
        if(nsfw) {
            if(imageIndex == rp.photos.length - 1) {
                return true;
            } else {
                return false;
            }
        } else {
            // look for remaining sfw images
            for(var i = imageIndex + 1; i < rp.photos.length; i++) {
                if(!rp.photos[i].over18) {
                    return false;
                }
            }
            return true;
        }
    };
    //
    // Starts the animation, based on the image index
    //
    // Variable to store if the animation is playing or not
    var isAnimating = false;
    var startAnimation = function (imageIndex) {
        resetNextSlideTimer();

        // If the same number has been chosen, or the index is outside the
        // rp.photos range, or we're already animating, do nothing
        if (activeIndex == imageIndex || imageIndex > rp.photos.length - 1 || imageIndex < 0 || isAnimating || rp.photos.length == 0) {
            return;
        }

        isAnimating = true;
        animateNavigationBox(imageIndex);
        slideBackgroundPhoto(imageIndex);

        // Set the active index to the used image index
        activeIndex = imageIndex;

        if (isLastImage(activeIndex) && rp.subredditUrl.indexOf('/imgur') != 0) {
            getRedditImages();
        }
    };

    var toggleNumberButton = function (imageIndex, turnOn) {
        var numberButton = $('#numberButton' + (imageIndex + 1));
        if (turnOn) {
            numberButton.addClass('active');
        } else {
            numberButton.removeClass('active');
        }
    };

    //
    // Animate the navigation box
    //
    var animateNavigationBox = function (imageIndex) {
        var photo = rp.photos[imageIndex];
        var subreddit = '/r/' + photo.subreddit;

        $('#navboxTitle').html(photo.title);
        $('#navboxSubreddit').attr('href', rp.redditBaseUrl + subreddit).html(subreddit);
        $('#navboxLink').attr('href', photo.url).attr('title', photo.title);
        $('#navboxCommentsLink').attr('href', photo.commentsLink).attr('title', "Comments on reddit");

        toggleNumberButton(activeIndex, false);
        toggleNumberButton(imageIndex, true);
    };

    //
    // Slides the background photos
    //
    var slideBackgroundPhoto = function (imageIndex) {

        // Retrieve the accompanying photo based on the index
        var photo = rp.photos[imageIndex];

        // Create a new div and apply the CSS
        var cssMap = Object();
        cssMap['display'] = "none";
        if(!photo.isVideo) {
            cssMap['background-image'] = "url(" + photo.url + ")";
            cssMap['background-repeat'] = "no-repeat";
            cssMap['background-size'] = "contain";
            cssMap['background-position'] = "center";
        }

        //var imgNode = $("<img />").attr("src", photo.image).css({opacity:"0", width: "100%", height:"100%"});
        var divNode = $("<div />").css(cssMap).addClass("clouds");
        if(photo.isVideo) {
            clearTimeout(nextSlideTimeoutId);
            var gfyid = photo.url.substr(1 + photo.url.lastIndexOf('/'));
            if(gfyid.indexOf('#') != -1)
                gfyid = gfyid.substr(0, gfyid.indexOf('#'));
            divNode.html('<img class="gfyitem" data-id="'+gfyid+'" data-controls="false"/>');
        }

        //imgNode.appendTo(divNode);
        divNode.prependTo("#pictureSlider");

        $("#pictureSlider div").fadeIn(ANIMATION_SPEED);
        if(photo.isVideo){
            gfyCollection.init();
            //ToDo: find a better solution!
            $(divNode).bind("DOMNodeInserted", function(e) {
                if(e.target.tagName.toLowerCase() == "video") {
                    var vid = $('.gfyitem > div').width('100%').height('100%');
                    vid.find('.gfyPreLoadCanvas').remove();
                    var v = vid.find('video').width('100%').height('100%');
                    vid.find('.gfyPreLoadCanvas').remove();
                    if (shouldAutoNextSlide)
                        v.removeAttr('loop');
                    v[0].onended = function (e) {
                        if (shouldAutoNextSlide)
                            nextSlide();
                    };
                }
            });
        }

        var oldDiv = $("#pictureSlider div:not(:first)");
        oldDiv.fadeOut(ANIMATION_SPEED, function () {
            oldDiv.remove();
            isAnimating = false;
        });
    };



    var verifyNsfwMakesSense = function() {
        // Cases when you forgot NSFW off but went to /r/nsfw
        // can cause strange bugs, let's help the user when over 80% of the
        // content is NSFW.
        var nsfwImages = 0;
        for(var i = 0; i < rp.photos.length; i++) {
            if(rp.photos[i].over18) {
                nsfwImages += 1;
            }
        }

        if(0.8 < nsfwImages * 1.0 / rp.photos.length) {
            nsfw = true;
            $("#nsfw").prop("checked", nsfw);
        }
    };


    var tryConvertUrl = function (url) {
        if (url.indexOf('imgur.com') > 0 || url.indexOf('/gallery/') > 0) {
            // special cases with imgur

            if (url.indexOf('gifv') >= 0) {
                if (url.indexOf('i.') === 0) {
                    url = url.replace('imgur.com', 'i.imgur.com');
                }
                return url.replace('.gifv', '.gif');
            }

            if (url.indexOf('/a/') > 0 || url.indexOf('/gallery/') > 0) {
                // albums aren't supported yet
                //console.log('Unsupported gallery: ' + url);
                return '';
            }

            // imgur is really nice and serves the image with whatever extension
            // you give it. '.jpg' is arbitrary
            // regexp removes /r/<sub>/ prefix if it exists
            // E.g. http://imgur.com/r/aww/x9q6yW9
            return url.replace(/r\/[^ \/]+\/(\w+)/, '$1') + '.jpg';
        }

        return '';
    };
    var goodExtensions = ['.jpg', '.jpeg', '.gif', '.bmp', '.png'];
    var isImageExtension = function (url) {
        var dotLocation = url.lastIndexOf('.');
        if (dotLocation < 0) {
            console.log("skipped no dot: " + url);
            return false;
        }
        var extension = url.substring(dotLocation);

        if (goodExtensions.indexOf(extension) >= 0) {
            return true;
        } else {
            //log("skipped bad extension: " + url);
            return false;
        }
    };

    var getRedditImages = function () {
        var handleData = function (data) {
            //redditData = data //global for debugging data
            // NOTE: if data.data.after is null then this causes us to start
            // from the top on the next getRedditImages which is fine.
            after = "&after=" + data.data.after;

            if (data.data.children.length === 0) {
                alert("No data from this url :(");
                return;
            }

            $.each(data.data.children, function (i, item) {
                addImageSlide({
                    url: item.data.url,
                    title: item.data.title,
                    over18: item.data.over_18,
                    subreddit: item.data.subreddit,
                    commentsLink: rp.redditBaseUrl + item.data.permalink
                });
            });

            verifyNsfwMakesSense();

            if (data.data.after == null) {
                console.log("No more pages to load from this subreddit, reloading the start");

                // Show the user we're starting from the top
                var numberButton = $("<span />").addClass("numberButton").text("-");
                addNumberButton(numberButton);
            }
        };
    };

    var getImgurAlbum = function (url) {
        var albumID = url.match(/.*\/(.+?$)/)[1];
        var jsonUrl = 'https://api.imgur.com/3/album/' + albumID;
        //log(jsonUrl);
        var failedAjax = function (data) {
            alert("Failed ajax, maybe a bad url? Sorry about that :(");
            failCleanup();
        };
        var handleData = function (data) {
            if (data.data.images.length === 0) {
                alert("No data from this url :(");
                return;
            }

            $.each(data.data.images, function (i, item) {
                addImageSlide({
                    url: item.link,
                    title: item.title,
                    over18: item.nsfw,
                    commentsLink: ""
                });
            });

            verifyNsfwMakesSense();

            if (!rp.foundOneImage) {
                console.log(jsonUrl);
                alert("Sorry, no displayable images found in that url :(");
            }
            if (activeIndex == -1) {
                startAnimation(0);
            }
        };
    };
});
