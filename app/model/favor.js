const { Sequelize, Model, Op } = require('sequelize')
const { sequelize } = require('@core/db')
const { Art } = require('@model/art')

class Favor extends Model {
  static async like(artId, type, uid) {
    const favor = await Favor.findOne({
      where: {
        artId,
        type,
        uid
      }
    })
    if (favor) {
      throw new global.errs.LikeError()
    }
    return sequelize.transaction(async t => {
      await Favor.create({
        artId,
        type,
        uid
      }, {
        transaction: t
      })
      const art = await Art.getData(artId, type, false)
      await art.increment('favNums', {
        by: 1,
        transaction: t
      })
    })
  }

  static async dislike(artId, type, uid) {
    const favor = await Favor.findOne({
      where: {
        artId,
        type,
        uid
      }
    })
    if (!favor) {
      throw new global.errs.DislikeError()
    }
    return sequelize.transaction(async t => {
      await favor.destroy({
        force: true,
        transaction: t
      })
      const art = await Art.getData(artId, type, false)
      await art.decrement('favNums', {
        by: 1,
        transaction: t
      })
    })
  }

  static async userLikeIt(artId, type, uid) {
    const favor = await Favor.findOne({
      where: {
        uid,
        artId,
        type,
      }
    })
    return favor ? true : false
  }

  // 查询所有点赞的期刊 movie、music、sentene 信息，再根据期刊 id 查具体信息列表
  static async getMyClassicFavors(uid) {
    const arts = await Favor.findAll({
      where: {
        uid,
        type: {
          [Op.not]: 400
        }
      }
    })
    if (!arts) {
      throw new global.errs.NotFound()
    }
    return await Art.getList(arts)
  }

  static async getBookFavor(bookId, uid) {
    const favorNums = await Favor.count({
      where: {
        artId: bookId,
        type: 400
      }
    })
    const myFavor = await Favor.findOne({
      where: {
        uid,
        artId: bookId,
        type: 400
      }
    })
    return {
      favNums: favorNums,
      likeStatus: myFavor ? 1 : 0
    }
  }

  static async getMyFavorBookCount(uid) {
    const count = await Favor.count({
      where: {
        type: 400,
        uid
      }
    })
    return count
  }
}

Favor.init({
  uid: Sequelize.INTEGER,
  artId: Sequelize.INTEGER,
  type: Sequelize.INTEGER
}, {
  sequelize,
  tableName: 'favor'
})

module.exports = {
  Favor
}