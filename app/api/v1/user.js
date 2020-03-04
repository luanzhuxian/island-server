const Router = require('koa-router')
const { User } = require('@model/user')
const { Auth } = require('@middlewares/auth')
const { success } = require('@lib/helper')
const { 
  RegisterValidator,
  UpdateUserValidator
 } = require('@validator')

const router = new Router({
  prefix: '/api/v1/user'
})

router.post('/register', async (ctx, next) => {
  const v = await new RegisterValidator().validate(ctx)
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname')
  }

  User.create(user)

  success()
})

router.post('/update', new Auth().m, async (ctx, next) => {
  const v = await new UpdateUserValidator().validate(ctx)
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname'),
    uid: ctx.auth.uid
  }

  await User.updateUser(user)

  success()
})

module.exports = router