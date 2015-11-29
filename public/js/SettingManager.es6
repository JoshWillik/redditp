class SettingManager extends EventEmitter {
  constructor () {
    super()
    this._settings = {}
    this.loadConfig()
  }

  loadConfig () {
    this._settings.showNsfw = this._loadKey('showNsfw')
    if (this._settings.showNsfw === null) {
      this._settings.showNsfw = false
    }
    this._settings.autoNext = this._loadKey('autoNext')
    if (this._settings.autoNext === null) {
      this._settings.autoNext = true
    }
    this._settings.autoNextTimeout = this._loadKey('autoNextTimeout')
    if (this._settings.autoNextTimeout === null) {
      this._settings.autoNextTimeout = 5
    }  }

  get (key) {
    return this._settings[key]
  }

  set (key, value) {
    this._settings[key] = value
    this._saveKey(key, value)

    this.emit(`changed:${key}`, value)
  }

  _loadKey (key) {
    return JSON.parse(localStorage.getItem(key))
  }
  _saveKey (key, value) {
    return localStorage.setItem(key, value)
  }
}
