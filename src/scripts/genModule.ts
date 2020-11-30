/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import prettier from "prettier";
import chalk from "chalk";
import inquirer from "inquirer";
const fsp = fs.promises;

const CONFIG_PATH = path.resolve(process.cwd(), "./moduleConfig.json");

function getComponentString(componentName: string) {
  return `/* eslint-disable @typescript-eslint/no-empty-interface */
import React from 'react'
interface IProps {}
const ${componentName}: React.FC<IProps> = () => {
  return <div>${componentName}</div>
}
export default ${componentName}
`;
}

function getPascalCaseName(value: string) {
  return value
    .split("-")
    .map((word) => word[0].toUpperCase() + word.substr(1))
    .join("");
}

function getConstName(value: string) {
  return value
    .split("-")
    .map((word) => word.toUpperCase())
    .join("_");
}

function beforeGenerate(basePath: string, type: string) {
  const startTime = Date.now();
  const config: IConfig = (global as any).MODULE_CONFIG;
  if (!fs.existsSync(path.resolve(basePath))) {
    console.log(chalk.yellow(`Stopped. Can not find path: ${basePath}`));
    return;
  }
  const modulePath = path.join(basePath, config.name);
  // 创建模块目录
  try {
    fs.mkdirSync(modulePath);
  } catch (error) {
    if (error.code === "EEXIST") {
      console.log(
        chalk.yellow(
          "The directory already exists, the page will be added incrementally."
        )
      );
    } else {
      console.log(
        chalk.red(`Failed to create folder: ${modulePath}, error: ${error}`)
      );
      return;
    }
  }
  return () => {
    const timeSpend = Date.now() - startTime;
    console.log(`${type} generation is completed, it takes ${timeSpend}ms`);
  };
}

function getPageTempate(fileName: string) {
  const componentName = getPascalCaseName(fileName);
  return getComponentString(componentName);
}

function getModelPage(fileName: string) {
  return `/* eslint-disable @typescript-eslint/no-empty-interface */
  import { Model } from 'wbd-frontend-kit'
  export const namespace = '${fileName}'
  
  export interface IState {
  }
  
  const initState: IState = {
  }
  
  export default {
    namespace,
    state: initState,
    effects: {},
    reducers: {
      setState(state, { payload }) {
        return { ...state, ...payload }
      },
    },
  } as Model
`;
}

function getModuleIndexPage(pages: string[]) {
  let importStr = "";
  const pageModuleList: string[] = [];
  for (const page of pages) {
    const pageModuleName = getPascalCaseName(page);
    importStr += `import ${pageModuleName} from './${page}'\n`;
    pageModuleList.push(pageModuleName);
  }
  return `${importStr}
export default { ${pageModuleList.join(", ")} }
`;
}

function checkPageExistAndGenerate(currentPagePath: string, page: string) {
  const { name }: IConfig = (global as any).MODULE_CONFIG;
  const exist = fs.existsSync(currentPagePath);
  if (exist) {
    return;
  }
  fs.mkdirSync(currentPagePath);
  logGenerateDir(currentPagePath);
  // 创建页面模板
  fs.writeFileSync(
    path.join(currentPagePath, "index.tsx"),
    getPageTempate(page)
  );
  logGenerateFile(path.join(currentPagePath, "index.tsx"));
  // 由于不需要单独创建models，因此单独创建model.ts文件
  fs.writeFileSync(
    path.join(currentPagePath, "model.ts"),
    getModelPage(`${name}-${page}`)
  );
  logGenerateFile(path.join(currentPagePath, "model.ts"));
}

function generatePage() {
  const {
    pages,
    pagePath: pageDirPath,
    name,
  }: IConfig = (global as any).MODULE_CONFIG;
  const pagePath = pageDirPath || "./src/pages";
  const basePath = path.resolve(process.cwd(), pagePath); // 基本目录的绝对路径
  const modulePath = path.join(basePath, name); // 模块目录路径
  const afterGenerate = beforeGenerate(basePath, "page");
  if (!afterGenerate) {
    return;
  }
  // 只创建index.ts
  if (!pages || pages.length === 0) {
    const content = "export default {}";
    fsp.writeFile(path.join(modulePath, "index.ts"), content).then(() => {
      logGenerateFile(path.join(modulePath, "index.ts"));
    });
  } else {
    // 创建具体页面
    for (const page of pages) {
      const currentPagePath = path.join(modulePath, page); // 创建具体的页面目录
      checkPageExistAndGenerate(currentPagePath, page);
    }
    // 统一导出，无论是新生成还是增量
    fs.writeFileSync(
      path.join(modulePath, "index.ts"),
      getModuleIndexPage(pages)
    );
    logGenerateFile(path.join(modulePath, "index.ts"));
  }
  afterGenerate();
}

function getRoutePaths() {
  const { pages, name }: IConfig = (global as any).MODULE_CONFIG;
  const moduleNamePrefix = name.split("-")[0];
  let result = `export const MODULE_INDEX = '/${moduleNamePrefix}'\n`;
  for (const page of pages) {
    const exportName = getConstName(page);
    result += `export const ${exportName} = '/${moduleNamePrefix}/${page}'\n`;
  }
  return result;
}

function getRouteIndexPage() {
  const { name, pages }: IConfig = (global as any).MODULE_CONFIG;
  const pageModuleName = getPascalCaseName(name);
  const pathNameList = pages.map((page) => getConstName(page));
  const routeList = pages.map((page) => {
    const path = getConstName(page);
    const componentName = getPascalCaseName(page);
    return `{
  path: ${path},
  component: ${pageModuleName}.${componentName},
  title: '${page}',
  exact: true
},
`;
  });
  return `import { IRouteConfig } from '../../typing'
import Layout from '@/pages/layout'
import ${pageModuleName} from '@/pages/${name}'
import { ${pathNameList.join(", ")}, MODULE_INDEX } from './path'
const route: IRouteConfig = {
  path: MODULE_INDEX,
  component: Layout,
  title: '布局页title',
  routes: [
    ${routeList.join("")}
  ]
}
export default route
  `;
}

function logGenerateFile(filePath: string) {
  console.log("Create File: ", chalk.green(filePath));
}

function logGenerateDir(filePath: string) {
  console.log("Create Dir: ", chalk.green(filePath));
}

function moduleHasPages() {
  const { pages, name }: IConfig = (global as any).MODULE_CONFIG;
  return name && pages && pages.length > 0;
}

function warnIfModelGenerated(modulePath: string) {
  const exist = fs.existsSync(modulePath);
  if (exist) {
    console.log(
      chalk.yellow(
        "This script does not currently support incremental routing configuration.\nPlease modify the routing configuration manually."
      )
    );
  }
  return exist;
}
// checked!
function generateRoutes() {
  const config: IConfig = (global as any).MODULE_CONFIG;
  const routePath = config.routePath || "./src/router/config"; // config dir
  const basePath = path.resolve(process.cwd(), routePath); // absolute path at config
  const modulePath = path.join(basePath, config.name); // module absolute path
  const routeFileName = path.join(modulePath, "index.ts");
  const pathFileName = path.join(modulePath, "path.ts");
  const afterGenerate = beforeGenerate(basePath, "route");
  if (!afterGenerate) {
    return;
  }
  // 如果是增量式，直接结束
  if (warnIfModelGenerated(modulePath)) {
    afterGenerate();
    return;
  }
  // 创建path.ts
  if (moduleHasPages()) {
    fs.writeFileSync(pathFileName, getRoutePaths());
    logGenerateFile(pathFileName);
  }
  // 创建index.ts
  fs.writeFileSync(
    routeFileName,
    prettier.format(getRouteIndexPage(), {
      singleQuote: true,
      semi: false,
      printWidth: 130,
    })
  );
  logGenerateFile(routeFileName);
  afterGenerate();
}

// 暂时只支持一级页面，子页面不支持生成
function genInitialConfig() {
  const configStr = `
{
  "name": "xx-module",
  "pages": ["page1", "page2"]
}
  `;
  try {
    fs.writeFileSync(CONFIG_PATH, configStr, { encoding: "utf-8" });
    logGenerateFile(CONFIG_PATH);
  } catch (error) {
    console.log(chalk.red("error happend when generate config file", error));
    process.exit(1);
  }
  console.log(
    chalk.green(
      `${CONFIG_PATH} generated, run command again to generate templates.`
    )
  );
}

interface IConfig {
  name: string; // module name
  pages: string[]; // pages name
  pagePath?: string;
  routePath?: string;
}

function run() {
  fsp.readFile(CONFIG_PATH, "utf-8").then((_config: string) => {
    const config: IConfig = JSON.parse(_config);
    (global as any).MODULE_CONFIG = config;
    // todo：支持增量式页面生成
    generatePage();
    generateRoutes();
  });
}

function getNodejsMainVersion(version: string) {
  const versions = version.substring(1).split(".");
  const mainVersion = Number(versions[0]);
  if (Number.isNaN(mainVersion)) {
    return -1;
  }
  return mainVersion;
}

module.exports = function () {
  // check Node.js version
  const currentNodeVersion = getNodejsMainVersion(process.version);

  if (currentNodeVersion < 10) {
    console.log(
      chalk.red(
        `Your current Node.js version is ${currentNodeVersion}, genModule does not support Node.js version below 10!`
      )
    );
    return;
  }

  // check config
  if (!fs.existsSync(CONFIG_PATH)) {
    const question = {
      type: "confirm",
      name: "genConfig",
      message:
        chalk.yellow("Could not find configuration file.") +
        "\n" +
        "would you want to initialize at: " +
        chalk.bold(CONFIG_PATH),
      default: true,
    };
    inquirer
      .prompt([question])
      .then((answer) => {
        if (!answer.genConfig) {
          console.log(
            chalk.red(
              "Can not run without config. Please configure the necessary configuration before continuing."
            )
          );
          process.exit(0);
        } else {
          genInitialConfig();
        }
      })
      .catch((err) => {
        console.log(chalk.red(`error happend: ${err}`));
      });
  } else {
    run();
  }
};
