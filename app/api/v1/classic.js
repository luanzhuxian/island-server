const Router = require('koa-router')
const { Art } = require('@model/art')
const { Flow } = require('@model/flow')
const { Favor } = require('@model/favor')
const { Auth } = require('@middlewares/auth')
const {
  PositiveIntegerValidator,
  ClassicValidator
} = require('@validator')

const router = new Router({
  prefix: '/api/v1/classic'
})

// 获取最新期刊
router.get('/latest', new Auth().m, async (ctx, next) => {
  const flow = await Flow.findOne({
    order: [
      ['index', 'DESC']
    ]
  })
  const art = await Art.getData(flow.artId, flow.type)
  const likeLatest = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
  // art 是类，koa 最后将其中 dataValue 序列化为 JSON，所以要赋值给 dataValue
  art.setDataValue('index', flow.index)
  art.setDataValue('likeStatus', likeLatest)
  ctx.body = art
})

router.get('/:index/next', new Auth().m, async ctx => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: 'index'
  })
  const index = v.get('path.index')
  const flow = await Flow.findOne({
    where: {
      index: index + 1
    }
  })
  if (!flow) {
    throw new global.errs.NotFound()
  }
  const art = await Art.getData(flow.artId, flow.type)
  const likeNext = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
  art.setDataValue('index', flow.index)
  art.setDataValue('likeStatus', likeNext)
  ctx.body = art
})

router.get('/:index/previous', new Auth().m, async ctx => {
  const v = await new PositiveIntegerValidator().validate(ctx, {
    id: 'index'
  })
  const index = v.get('path.index')
  const flow = await Flow.findOne({
    where: {
      index: index - 1
    }
  })
  if (!flow) {
    throw new global.errs.NotFound()
  }
  const art = await Art.getData(flow.artId, flow.type)
  const likePrevious = await Favor.userLikeIt(flow.artId, flow.type, ctx.auth.uid)
  art.setDataValue('index', flow.index)
  art.setDataValue('likeStatus', likePrevious)
  ctx.body = art
})

// 获取某个期刊详情 + 是否点赞
router.get('/:type/:id', new Auth().m, async ctx => {
  const v = await new ClassicValidator().validate(ctx)
  const id = v.get('path.id')
  const type = parseInt(v.get('path.type'))
  
  const art = await Art.getData(id, type)
     if (!art) {
      throw new global.errs.NotFound()
    }
  const like = await Favor.userLikeIt(id, type, ctx.auth.uid)
  art.setDataValue('likeStatus', like)

  ctx.body = {
    art
  }
})

// 获取某个期刊点赞数 + 是否点赞
router.get('/:type/:id/favor', new Auth().m, async ctx => {
  const v = await new ClassicValidator().validate(ctx)
  const id = v.get('path.id')
  const type = parseInt(v.get('path.type'))
  
  const art = await Art.getData(id, type)
  if (!art) {
    throw new global.errs.NotFound()
  }
  const like = await Favor.userLikeIt(id, type, ctx.auth.uid)
  ctx.body = {
    favNums: art.favNums,
    likeStatus: like
  }
})

// 获取我点赞的所有期刊列表
router.get('/favor', new Auth().m, async ctx => {
  const uid = ctx.auth.uid
  ctx.body = await Favor.getMyClassicFavors(uid)
})

module.exports = router