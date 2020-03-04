const Router = require('koa-router')
const requireDirectory = require('require-directory')

class InitManager {

  static init(app) {
    InitManager.app = app
    InitManager.initLoadRouters()
    InitManager.loadHttpException()
    InitManager.loadConfig()
  }

  static initLoadRouters() {
    // 获取绝对路径
    const dir = `${process.cwd()}/app/api/v1`
    requireDirectory(module, dir, {
      visit (obj) {
        if (obj instanceof Router) {
          InitManager.app.use(obj.routes())
        }
      }
    })
  }

  static loadHttpException () {
    const errors = require('./http-exception')
    global.errs = errors
  }

  static loadConfig (path = '') {
    const configPath = path || process.cwd() + '/config/config.js'
    const config = require(configPath)
    global.config = config
  }
}

module.exports = InitManager