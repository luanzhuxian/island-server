require('module-alias/register')

const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const InitManager = require('./core/init')
const catchError = require('./middlewares/exception')
const path = require('path')
const static = require('koa-static')

const app = new Koa()

// middlewares
app.use(catchError)
app.use(bodyparser())
app.use(static(path.join(__dirname, './static')))

InitManager.init(app)
app.listen(3000)
