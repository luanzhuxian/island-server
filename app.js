const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const static = require('koa-static')
const path = require('path')
const InitManager = require('./core/init')
const catchError = require('./middlewares/exception')

// require('./app/model/user')

const app = new Koa()

// middlewares
app.use(catchError)
app.use(bodyparser())
app.use(static(path.join(__dirname, './static')))

// app.use((ctx, next) => {
//     if (ctx.path === '/test' && ctx.method === 'GET') {
//         ctx.body = 'asd'
//     }
//     console.log(1)
//     next()
//     console.log(2)
// })
// app.use((ctx, next) => {
//     console.log(3)
//     next()
//     console.log(4)
//     throw new Error('test')
// })

InitManager.init(app)
app.listen(3000)
