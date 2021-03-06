const { Sequelize, Model } = require('sequelize')
const { unset, clone } = require('lodash')
const {
  dbName,
  host,
  port,
  user,
  password
} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  host,
  port,
  // logging: true,
  timezone: '+08:00', // 东八区
  define: {
    paranoid: true, // 不删除数据库条目,但将新添加的属性deletedAt设置为当前日期(删除完成时)
    underscored: true, // 将自动设置所有属性的字段参数为下划线命名方式
    // 全局定义 scope，命名为 filter
    scopes: {
      filter: {
        attributes: {
          // 查寻时不返回的字段
          exclude: ['updatedAt', 'deletedAt', 'createdAt']
        }
      }
    },
  }
})

sequelize.sync(
  // {
  //   force: true // 自动删除原来表，重新创建新的表
  // }
)

// 全局 JSON 序列化
Model.prototype.toJSON = function () {
  let data = clone(this.dataValues)

  unset(data, 'updatedAt')
  unset(data, 'createdAt')
  unset(data, 'deletedAt')

  // if (Array.isArray(this.exclude)) {
  //   this.exclude.forEach(val => unset(data, val))
  // }

  for (key in data) {
    if (key === 'image') {
      if (!data[key].startsWith('http'))
        data[key] = global.config.host + data[key]
    }
  }

  return data
}

module.exports = {
  sequelize
}