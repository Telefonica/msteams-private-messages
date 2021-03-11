// @bug * https://github.com/sequelize/sequelize/issues/9489 *
const mysql2 = require('mysql2')
const { log } = require('../../../src/log')

module.exports = {
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  development: {
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || null,
    database: process.env.MYSQL_DATABASE || 'msteamsbot',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: msg => log.trace(msg) /* route db log to app's log - TRACE level */
  }
}
