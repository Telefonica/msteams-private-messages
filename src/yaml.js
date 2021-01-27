const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { log } = require('./log')

/**
 * @param {string} filename "bot"
 */
const readYaml = fileName => {
  try {
    const filePath = path.join(process.cwd(), 'config', fileName)
    const file = fs.readFileSync(filePath + '.yaml', 'utf8')
    const doc = yaml.load(file)
    return doc
  } catch (err) {
    log.error(err, `${fileName}.yaml`)
    return {}
  }
}

module.exports = { readYaml }
