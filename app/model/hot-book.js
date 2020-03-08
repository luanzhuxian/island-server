const { Sequelize, Model, Op } = require('sequelize')
const { sequelize } = require('@core/db')
const { Favor } = require('@model/favor')

class HotBook extends Model {
  static async getAll() {
    const books = await HotBook.findAll({
      order: ['index']
    })

    const ids = books.map(book => book.id)
    const favors = await Favor.findAll({
      where: {
        artId: {
          [Op.in]: ids
        },
        type: 400
      },
      group: ['artId'], // 根据 artId 对数据进行分组
      attributes: ['artId', [Sequelize.fn('COUNT', '*'), 'count']]  // 查出的数据包含哪些字段，用帮助函数计数 artId 出现的次数，并重命名为 count
    })

    books.forEach(book => {
      HotBook._getEachBookStatus(book, favors)
    })

    // return books.filter(book => book.get('favNums') > 0)
    return books
  }

  // 合并 book 的点赞数到 book 信息里
  static _getEachBookStatus(book, favors) {
    let count = 0
    favors.forEach(favor => {
      if (favor.artId === book.id) {
        count = favor.get('count')
      }
    })
    book.setDataValue('favNums', count)
    return book
  }
}

HotBook.init({
  index: Sequelize.INTEGER,
  image: Sequelize.STRING,
  author: Sequelize.STRING,
  title: Sequelize.STRING
}, {
  sequelize,
  tableName: 'hot_book'
})

module.exports = {
  HotBook
}