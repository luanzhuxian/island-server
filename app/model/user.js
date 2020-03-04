const bcrypt = require('bcryptjs')
const { Sequelize, Model, Op } = require('sequelize')
const { sequelize } = require('@core/db')

class User extends Model {
  // email 登录查询用户信息
  static async verifyEmailPassword(email, plainPassword) {
    const user = await User.findOne({
      where: {
        email
      }
    })
    if (!user) {
      throw new global.errs.AuthFailed('账号不存在')
    }
    const correct = bcrypt.compareSync(plainPassword, user.password)
    if (!correct) {
      throw new global.errs.AuthFailed('密码不正确')
    }
    return user
  }

  // 小程序 登录查询用户信息
  static async getUserByOpenid(openid) {
    const user = await User.findOne({
      where: {
        openid
      }
    })

    return user
  }

  static async registerByOpenid(openid) {
    return await User.create({
      openid
    })
  }

  static async updateUser ({ email, password, nickname, uid }) {
    async function _check (email, uid) {
      const user = await User.findOne({
        where: {
          email,
          id: {
            [Op.not]: uid
          }
        }
      })
      if (user) {
        throw new global.errs.AuthFailed('邮箱已存在')
      }
      return user
    }

    const user = await _check(email, uid)

    User.update({
      email,
      password,
      nickname
    }, {
      where: {
        id: uid
      }
    })
    return user
  }
}

// 映射数据库 user 表
User.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true, // 主键
    autoIncrement: true // 自动增长
  },
  nickname: Sequelize.STRING,
  email: {
    type: Sequelize.STRING(128),
    unique: true // 唯一性
  },
  password: {
    type: Sequelize.STRING,
    set(val) {
      const salt = bcrypt.genSaltSync(10)
      const pwd = bcrypt.hashSync(val, salt)
      this.setDataValue('password', pwd)
    }
  },
  openid: {
    type: Sequelize.STRING(64),
    unique: true // 唯一性
  }
}, {
  sequelize,
  tableName: 'user' // 重命名
})

module.exports = {
  User
}