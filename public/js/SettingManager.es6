class SettingManager extends EventEmitter {
  constructor () {
    super()
    this._settings = {}
    this.loadConfig()
  }

  loadConfig () {
    this._settings.showNsfw = this._loadKey('show-nsfw') || false
    this._settings.autoNext = this._loadKey('auto-next') || true
    this._settings.autoNextTimeout = this._loadKey('auto-next-timeout') || 5
  }

  get (key) {
    return this._settings[key]
  }

  set (key, value) {
    this._settings[key] = value
    this._saveKey(key, value)

    this.emit(`changed:${key}`, value)
  }

  _loadKey (key) {
    return localStorage.getItem(key)
  }
  _saveKey (key, value) {
    return localStorage.setItem(key, value)
  }
}
