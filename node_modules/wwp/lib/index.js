/**
 * # Weex Web Packer
 * 
 * This package plugin just works for the versions after(including) weex-html5 0.3.0. A `.wwprc` file
 * for configuration is always needed.
 *
 * @author MrRaindrop
 * @github https://github.com/MrRaindrop
 *
 * @usage: pack(options)
 *
 * @options
 *   - components: specify the components to pack in.
 *   - apis: specify the apis to pack in.
 *   - debug: show logs if true.
 *   - packer: file path of the 'packer' to generate.
 *   - componentsPath: file path of the components.
 *   - apisPath: file path of the APIs.
 *   - bundle: (required) the transformed bundle of .we file or a .we file.
 *   - npm/cnpm/tnpm: a list of extensions (components and apis modules) and required from npm instead of local path.
 *     a demo for specifying a cnpm module:
 *       - "npm": [{
 *         "platform": "cnpm", // or "yarn" if you have the yarn installed in global.
 *         "modules": {
 *           "weex-picker-web": "*"
 *         }
 *       }]
 */

var path = require('path')
var eol = require('os').EOL
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var request = require('request')
var requestAsync = Promise.promisify(request)
const execSync = require('child_process').execSync
var chalk = require('chalk')
var os = require('os')

var log = require('./log')

var root = process.cwd()
var indexPath = path.resolve(root, './index.html')
var bundleDir = path.resolve(root, './bundle')
var bundledIndexPath = path.resolve(bundleDir, 'build', 'index.html')
var webpackBundleConfig = path.resolve(root, './build/webpack.bundle.config.js')

function createFile(fpath) {
  fs.outputFileSync(fpath, '')
}

var logGreen = chalk.bold.green
var logYellow = chalk.bold.yellow

var packerPath = ''
var tips = {}
var content = ''
var exportLine = ''

function isUrl (path) {
  return path.match('^https?\:\/\/')
}

/**
 * for examples, tips is like:
 * tips: {
 *   components: [{
 *     name: 'div',
 *     size: '100',
 *     path: './comp/div'
 *   }, {
 *     name: 'text',
 *     size: '20',
 *     path: './comp/text'
 *   }],
 *   apis: [{
 *     name: 'dom',
 *     size: '200',
 *     path: './apis/dom'
 *   }],
 *   cnpm: [{
 *     name: 'weex-picker-web',
 *     path: '*'
 *   }],
 * }
 */
function outputTips() {
  for (var key in tips) {
    console.log('pack ' + key + ':')
    var ts = tips[key]
    console.log(logYellow('     name\t\tpath'))
    ts.forEach(function (tip) {
      console.log(logGreen('     ' + tip.name), '  (' + tip.path + ')')
    })
  }
}

// originPath [String] relative path
// 1. replace \ to / in Windows
// 2. insert './' at head if needed
function convertPathForImport(originPath) {
  var result = originPath
  if (os.platform() === 'win32') {
    result = result.replace(/\\/g, '/')
  }
  if (result.indexOf('../') === -1 && result.indexOf('./') === -1) {
    result = './' + result
  }
  return result
}

function initPacker (options) {
  packerPath = options.packer
  try {
    fs.accessSync(packerPath, fs.W_OK)
  } catch (err) {
    createFile(packerPath)
  }
  var stats = fs.statSync(packerPath)
  stats.isDirectory() && (packerPath = path.resolve(packerPath, 'packer.js'))
  log('packerPath: ', packerPath)
}

// import components
function processComponents (options) {
  var components = options.components || []
  if (components.length <= 0) {
    return
  }
  var cmpPath = options.componentsPath
  log('cmpPath: ', cmpPath)
  if (!fs.statSync(cmpPath).isDirectory()) {
    return console.error('cmpPath ' + cmpPath + 'is not a valid directory.')
  }

  // process components' imports
  content += '// import components.' + eol
  log('components-->', JSON.stringify(components, null, 2))

  tips.components = []
  components.forEach(function (comp) {
    var name = comp[0].toUpperCase() + comp.substr(1)
    var thePath = path.resolve(cmpPath, comp)
    var p = path.relative(path.parse(packerPath).dir, path.resolve(cmpPath, comp))
    p = convertPathForImport(p)
    content += 'import ' + name + ' from \'' + p + '\'' + eol
    exportLine += name + ', '
    tips.components.push({
      name: comp,
      path: convertPathForImport(path.relative(root, thePath))
    })
  })
}

// import APIs
function processApis (options) {
  var apis = options.apis || []
  if (apis.length <= 0) {
    return
  }
  var apisPath = options.apisPath
  log('apisPath: ', apisPath)
  if (!fs.statSync(apisPath).isDirectory()) {
    return console.error('apisPath ' + apisPath + 'is not a valid directory.')
  }

  // process apis' imports
  content += eol + '// import apis.' + eol
  log('apis-->', JSON.stringify(apis, null, 2))

  tips.apis = []
  apis.forEach(function (api) {
    var name = api[0].toUpperCase() + api.substr(1)
    var thePath = path.resolve(apisPath, api)
    var p = path.relative(path.parse(packerPath).dir, thePath)
    p = convertPathForImport(p)
    content += 'import ' + name + ' from \'' + p + '\'' + eol
    exportLine += name + ', '
    tips.apis.push({
      name: api,
      path: convertPathForImport(path.relative(root, thePath))
    })
  })
}

// import loaders
function processLoaders (options) {
  var loaders = options.loaders || []
  if (loaders.length <= 0) {
    return
  }
  var loadersPath = options.loadersPath
  log('loadersPath: ', loadersPath)
  if (!fs.statSync(loadersPath).isDirectory()) {
    return console.error('loadersPath ' + loadersPath + 'is not a valid directory.')
  }

  // process apis' imports
  content += eol + '// import loaders.' + eol
  log('loaders-->', JSON.stringify(loaders, null, 2))

  tips.loaders = []
  loaders.forEach(function (loader) {
    var name = loader[0].toUpperCase() + loader.substr(1)
    var thePath = path.resolve(loadersPath, loader)
    var p = convertPathForImport(path.relative(path.parse(packerPath).dir, thePath))
    content += 'import ' + name + ' from \'' + p + '\'' + eol
    exportLine += name + ', '
    tips.loaders.push({
      name: loader,
      path: convertPathForImport(path.relative(root, thePath))
    })
  })
}

function processNpm (options) {
  var npm = options.npm || []

  if (npm.length <= 0) {
    return
  }
  // process npm imports
  content += eol + '// import npm modules.' + eol
  log('npm modules-->', JSON.stringify(npm, null, 2))

  ; (npm || []).forEach(function (npm) {
    var p = npm.platform
    tips[p] = []
    var cmd = p + ' install '
    var mods = npm.modules
    var modsArr = []
    for (var k in mods) {
      var name = k.split(/[-.]/).map(function (part) {
          return part[0].toUpperCase() + part.substr(1)
        }).join('')
      exportLine += name + ', '
      content += 'import ' + name + ' from \'' + k + '\'' + eol
      modsArr.push(k + '@' + mods[k]) // 'package@version'
      tips[p].push({
        name: k,
        path: 'ver: ' + mods[k]
      })
    }
    cmd += modsArr.join(' ')
    console.log('running ' + cmd + '...\n')
    execSync(cmd)
  })
}

function processWeBundle (options, wePath, html) {
  var bundle = options.bundle
  function genLocalWe (wePath) {
    var localWePath = path.resolve(bundleDir, bundle.name + '.we')
    if (isUrl(wePath)) {
      return fs.requestAsync(bundle)
        .then(function (resp) {
          if (resp.statusCode === 200) {
            return resp.body
          } else {
            throw new Error('request bundle failed (' + resp.statusCode + '): ' + bundle)
          }
        })
        .then(function (weCode) {
          return fs.outputFileAsync(localWePath, weCode)
        })
        .then(function () {
          return localWePath
        })
    }
    else {
      return Promise.resolve(wePath)
    }
  }

  return genLocalWe(wePath)
    .then(function (localWePath) {
      var localBundleJsPath = path.resolve(bundleDir, bundle.name + '.js')
      return execSync('webpack --config ' + webpackBundleConfig
          + ' ' + localWePath
          + ' ' + localBundleJsPath)
        .then(function () {
          return processJsBundle(options, localBundleJsPath, html)
        })
    })
}

function processJsBundle (options, jsPath, html) {
  var bundle = options.bundle
  var bundleMark = bundle.mark
  var bundleMinPath = path.resolve(bundleDir, 'build', bundle.name + '.min.js')
  function genLocalBundleJs (jsPath) {
    var localBundleJsPath = path.resolve(bundleDir, 'build', bundle.name + '.js')
    if (isUrl(jsPath)) {
      return fs.requestAsync(jsPath)
        .then(function (resp) {
          if (resp.statusCode === 200) {
            return resp.body
          } else {
            throw new Error('request bundle failed (' + resp.statusCode + '): ' + bundle)
          }
        })
        .then(function (bundleCode) {
          return fs.outputFileAsync(localBundleJsPath, bundleCode)
        })
        .then(function () {
          return localBundleJsPath
        })
    } else {
      return Promise.resolve(jsPath)
    }
  }

  return genLocalBundleJs(jsPath)
    .then(function (bundlePath) {
      return execSync('uglifyjs ' + bundlePath + ' -o ' + bundleMinPath)
    })
    .then(function () {
      return fs.readFileAsync(bundleMinPath, 'utf-8')
    })
    .then(function (bundleCode) {
      bundleCode = bundleCode
        /**
         * escape \ and ' for string transforming
         *
         * cases:
         * 1. console.log('test') -> [' => \'] -> 'console.log(\'test\')'
         * 2. "console.log('test')" -> [' => \'] -> '"console.log(\'test\')"'
         * 3. 'console.log(\'test\')' -> [' => \', \' => \\\'] -> '\'console.log(\\\'test\\\')\''
         * 4. "console.log(\"test\")" -> [\ => \\] -> '"console.log(\\"test\\")"'
         * 5. new Error("Cannot find module '"+o+"'") -> new Error("Cannot find module \\'"+o+"\\'");
         * 
         * transform：
         * 1. ' -> \'
         * 2. \ -> \\
         *
         * these too transformation should take place simultaneously.
         */
        .replace(/\'|\\/g, function ($0) {
          return ({
            '\'': '\\\'',
            '\\': '\\\\'
          })[$0]
        })
        .replace(/\r\n|\n/g, '')
      return fs.outputFileAsync(bundledIndexPath, html.replace(bundleMark, bundleCode))
    })
}

function processBundle (options) {
  var bundle = options.bundle
  if (!bundle) {
    return
  }

  var wePath = bundle.we
  var jsPath = bundle.js
  var bundleMark = bundle.mark
  var html = ''
  tips['bundle'] = [{
    name: 'bundle',
    path: jsPath || wePath || ' - '
  }]

  return fs.readFileAsync(indexPath, 'utf-8')
    .then(function (html) {
      if (html.indexOf(bundleMark) <= -1) {
        throw new Error('missing ' + bundleMark + ' mark in index file.')
        process.exit(-1)
      }

      if (!jsPath) {
        return processWeBundle(options, wePath, html)
      }
      return processJsBundle(options, jsPath, html)
    })
}

module.exports = {
  pack: function (options) {
    log = log(options.debug).log

    initPacker(options)

    processComponents(options)
    processApis(options)
    processLoaders(options)
    processNpm(options)
    processBundle(options)

    log('exportLine-->', exportLine.slice(0, -2))
    // content += eol + 'module.exports = [' + exportLine.slice(0, -2) + ']' + eol
    content += eol + 'export default { ' + exportLine.slice(0, -2) + ' }' + eol

    outputTips()

    // write file
    fs.outputFileAsync(packerPath, content)
  }
}
