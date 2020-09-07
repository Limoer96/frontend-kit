/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fsp = require('fs').promises
const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const chalk = require('chalk')
const inquirer = require('inquirer')

const CONFIG_PATH = path.resolve(process.cwd(), './moduleConfig.json')

function getComponentString(componentName) {
  return `/* eslint-disable @typescript-eslint/no-empty-interface */
import React from 'react'
interface IProps {}
const ${componentName}: React.FC<IProps> = () => {
  return <div>${componentName}</div>
}
export default ${componentName}
`
}

function getPascalCaseName(value) {
  return value
    .split('-')
    .map((word) => word[0].toUpperCase() + word.substr(1))
    .join('')
}

function getConstName(value) {
  return value
    .split('-')
    .map((word) => word.toUpperCase())
    .join('_')
}

function beforeGenerate(basePath) {
  const startTime = Date.now()
  const config = global.MODULE_CONFIG
  if (!fs.existsSync(path.resolve(basePath))) {
    console.log(chalk.yellow(`Stopped. Can not find path: ${basePath}`))
    return
  }
  const modulePath = path.join(basePath, config.name)
  // 创建模块目录
  try {
    fs.mkdirSync(modulePath)
  } catch (error) {
    console.error(chalk.red(`Failed to create folder: ${modulePath}`))
    return
  }
  return () => {
    const timeSpend = Date.now() - startTime
    console.log(`Module generation is completed, it takes ${timeSpend}ms`)
  }
}

function getPageTempate(fileName) {
  const componentName = getPascalCaseName(fileName)
  return getComponentString(componentName)
}

function getModelPage(fileName) {
  return `/* eslint-disable @typescript-eslint/no-empty-interface */
export const namespace = '${fileName}'

export interface IState {}
const state: IState = {}

export default {
  namespace,
  state,
  effects: {},
  reducers: {
    setState(state, { payload }) {
      return { ...state, ...payload }
    }
  }
}
`
}

function getModuleIndexPage(pages) {
  let importStr = ''
  const pageModuleList = []
  for (const page of pages) {
    const pageModuleName = getPascalCaseName(page)
    importStr += `import ${pageModuleName} from './${page}'\n`
    pageModuleList.push(pageModuleName)
  }
  return `${importStr}
export default { ${pageModuleList.join(', ')} }
`
}

function getModelIndexPage(pages) {
  let importStr = ''
  const pageModuleList = []
  for (const page of pages) {
    const pageModuleName = getPascalCaseName(page)
    importStr += `import ${pageModuleName} from './${page}'\n`
    pageModuleList.push(pageModuleName)
  }
  return `${importStr}
export default [${pageModuleList.join(', ')}]
`
}

function generatePage() {
  const config = global.MODULE_CONFIG
  const pagePath = './src/pages' || config.pagePath
  const basePath = path.resolve(__dirname, pagePath)
  const modulePath = path.join(basePath, config.name) // 模块页
  const afterGenerate = beforeGenerate(basePath)
  if (!afterGenerate) {
    return
  }
  // 只创建index.ts
  if (!config.pages || config.pages.length === 0) {
    const content = 'export default {}'
    fsp.writeFile(path.join(modulePath, 'index.ts'), content).then(() => {
      console.log(`创建page ${path.join(modulePath, 'index.ts')}成功`)
    })
    return
  }
  // 创建具体页面
  for (const page of config.pages) {
    const currentPagePath = path.join(modulePath, page)
    fs.mkdirSync(currentPagePath)
    fs.writeFileSync(
      path.join(currentPagePath, 'index.tsx'),
      getPageTempate(page)
    )
  }
  fs.writeFileSync(
    path.join(modulePath, 'index.ts'),
    getModuleIndexPage(config.pages)
  )
  afterGenerate()
}

function generateModels() {
  const config = global.MODULE_CONFIG
  const modelPath = './src/models' || config.modelPath
  const basePath = path.resolve(__dirname, modelPath) // 根目录
  const modulePath = path.join(basePath, config.name) // 模块页
  const afterGenerate = beforeGenerate(basePath) // 创建modulePath并计时
  if (!afterGenerate) {
    return
  }
  // 只创建index.ts
  if (!config.pages || config.pages.length === 0) {
    const content = 'export default []'
    fsp.writeFile(path.join(modulePath, 'index.ts'), content).then(() => {
      console.log(`创建page ${path.join(modulePath, 'index.ts')}成功`)
    })
    return
  }
  // 创建具体页面
  for (const page of config.pages) {
    const currentPagePath = path.join(modulePath, page)
    fs.mkdirSync(currentPagePath)
    fs.writeFileSync(path.join(currentPagePath, 'index.ts'), getModelPage(page))
  }
  fs.writeFileSync(
    path.join(modulePath, 'index.ts'),
    getModelIndexPage(config.pages)
  )
  afterGenerate()
}

function getRoutePaths(pages) {
  let result = ''
  for (const page of pages) {
    const exportName = getConstName(page)
    result += `export const ${exportName} = '/dashboard/${page}'\n`
  }
  return result
}

function getRouteIndexPage() {
  const { name, pages } = global.MODULE_CONFIG
  const pageModuleName = getPascalCaseName(name)
  const pathNameList = pages.map((page) => getConstName(page))
  const routeList = pages.map((page) => {
    const path = getConstName(page)
    const componentName = getPascalCaseName(page)
    return `{
  path: ${path},
  component: ${pageModuleName}.${componentName},
  breadcrumb: [],
  exact: true,
  pageTitle: '',
  useLayout: true
},\n
`
  })
  return `import { IRouteConfig } from '../../typing'
import ${pageModuleName} from '@/pages/${name}'
import { ${pathNameList.join(', ')} } from './path'
const route: IRouteConfig[] = [
  ${routeList.join('')}
]
export default route
  `
}

function logGenerateFile(filePath) {
  console.log('Create: ', chalk.green(filePath))
}
// checked!
function generateRoutes() {
  const config = global.MODULE_CONFIG
  const routePath = './src/router/config' || config.routePath
  const basePath = path.resolve(process.cwd(), routePath) // absolute path at config
  const modulePath = path.join(basePath, config.name)
  const afterGenerate = beforeGenerate(basePath)
  if (!afterGenerate) {
    return
  }
  // 创建index.ts
  if (!config.pages || config.pages.length === 0) {
    const content = `import { IRouteConfig } from '../../typing'
const routes: IRouteConfig[] = []
export default routes
    `
    const filePath = path.join(modulePath, 'index.ts')
    fs.writeFileSync(filePath, content)
    logGenerateFile(filePath)
  } else {
    // 创建path.ts
    fs.writeFileSync(
      path.join(modulePath, 'path.ts'),
      getRoutePaths(config.pages)
    )
    logGenerateFile(path.join(modulePath, 'path.ts'))
    // 创建index.ts
    fs.writeFileSync(
      path.join(modulePath, 'index.ts'),
      prettier.format(getRouteIndexPage(), {
        singleQuote: true,
        semi: false,
        printWidth: 130,
      })
    )
    logGenerateFile(path.join(modulePath, 'index.ts'))
  }
  afterGenerate()
}

function genInitialConfig() {
  const configStr = `
    {
      "name": "xx-module",
      "pages": ["page1", "page2"]
    }
  `
  fs.writeFileSync(CONFIG_PATH, configStr, { encoding: 'utf-8' })
}

function run() {
  fsp.readFile(CONFIG_PATH, 'utf-8').then((file) => {
    const config = JSON.parse(file)
    global.MODULE_CONFIG = config
    generatePage()
    generateModels()
    generateRoutes()
  })
}

function getNodejsMainVersion(version) {
  const versions = version.split('.')
  const mainVersion = Number(versions[0])
  if (Number.isNaN(mainVersion)) {
    return -1
  }
  return mainVersion
}

module.exports = function () {
  // check Node.js version
  const currentNodeVersion = getNodejsMainVersion(process.version)

  if (currentNodeVersion <= 10) {
    console.log(
      chalk.red(
        `Your current Node.js version is ${currentNodeVersion}, genModule does not support Node.js version below 10!`
      )
    )
    return
  }

  // check config
  if (!fs.existsSync(CONFIG_PATH)) {
    const question = {
      type: 'confirm',
      name: 'genConfig',
      message:
        chalk.yellow('Could not find configuration file.') +
        '\n\n' +
        'would you want to initialize at: ' +
        chalk.bold(CONFIG_PATH),
      default: true,
    }
    inquirer.prompt(question).then((answer) => {
      if (!answer.genConfig) {
        console.log(
          chalk.red(
            'Can not run without config. Please configure the necessary configuration before continuing.'
          )
        )
        process.exit(0)
      } else {
        genInitialConfig()
      }
    })
  }

  // run
  run()
}
