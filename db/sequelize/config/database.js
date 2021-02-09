console.log(process.env)
// @bug * https://github.com/sequelize/sequelize/issues/9489 *
const mysql2 = require('mysql2');

module.exports = {
  development: {
    username: process.env.MYSQL_HOST || 'root',
    password: process.env.MYSQL_PASSWORD || null,
    database: process.env.MYSQL_DATABASE || 'msteams-private-messages',
    host: process.env.MYSQL_PORT || '127.0.0.1',
    port: process.env.MYSQL_HOST || 3306,
    dialect: 'mysql',
    dialectModule: mysql2
  }
}
