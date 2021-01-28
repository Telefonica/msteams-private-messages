const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { log } = require('./log')

/**
 * @param {string} filename "config"
 * @return {any}
 */
const readYaml = filename => {
  try {
    const filePath = path.join(process.cwd(), filename)
    const file = fs.readFileSync(filePath + '.yaml', 'utf8')
    const doc = yaml.load(file)
    return doc
  } catch (err) {
    log.error(err, `${filename}.yaml`)
    return {}
  }
}

/**
 * @return {Types.Config}
 */
const readConfig = (path = 'config') => readYaml(path)

module.exports = { readConfig }
