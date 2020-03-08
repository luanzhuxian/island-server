const axios = require('axios')
const util = require('util')
const { Sequelize, Model } = require('sequelize')
const { sequelize } = require('@core/db')

class Book extends Model {
  // Model 里定义 constructor 返回值会有问题，只返回有 defaultValue 的字段
  // constructor() {
  //   super()
  // }

  static async getDetail(id) {
    const url = util.format(global.config.yushu.detailUrl, id)
    const detail = await axios.get(url)
    return detail.data
  }

  static async searchFromYuShu(q, start, count, summary = 1) {
    const url = util.format(
      global.config.yushu.keywordUrl,
      encodeURI(q), // 将中文编码
      count,
      start,
      summary
    )
    const result = await axios.get(url)
    return result.data
  }

  // static async getMyFavorBookCount(uid) {
  //   // 局部引用 避免循环引用
  //   const { Favor } = require('@model/favor')

  //   const count = await Favor.count({
  //     where: {
  //       type: 400,
  //       uid
  //     }
  //   })
  //   return count
  // }
}

Book.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  favNums: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  tableName: 'book'
})

module.exports = {
  Book
}