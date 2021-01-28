const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { log } = require('./log')

/**
 * @param {string} filename "bot"
 * @return {any}
 */
const readYaml = filename => {
  try {
    const filePath = path.join(process.cwd(), 'config', filename)
    const file = fs.readFileSync(filePath + '.yaml', 'utf8')
    const doc = yaml.load(file)
    return doc
  } catch (err) {
    log.error(err, `${filename}.yaml`)
    return {}
  }
}

module.exports = { readYaml }
