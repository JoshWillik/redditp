;(function(){

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

window.ShortCutListener = ShortCutListener
})()
