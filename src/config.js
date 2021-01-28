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
    log.error(err, `${filename}.yaml not found`)
    return undefined
  }
}

/**
 * @return {Types.Config}
 */
const readConfig = (path = 'config') => {
  const config = readYaml(path)
  if (!config) {
    log.warn(
      'using default (example) config\n',
      'you must add a "config.yaml" file at root folder.'
    )
    return readYaml('config.example') // example by default
  }
  return config
}

module.exports = { readConfig }
