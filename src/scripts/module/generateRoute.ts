import fs from "fs";
import chalk from "chalk";
import prettier from "prettier";
import { IConfig } from "./typing";
import {
  beforeGenerate,
  getConstName,
  getPascalCaseName,
  logGenerateFile,
  logModifyFile,
} from "./utils";

import paths from "./path";

function moduleHasPages() {
  const { pages, name }: IConfig = (global as any).MODULE_CONFIG;
  return name && pages && pages.length > 0;
}

function getRoutePaths(pathFileName: string) {
  const { pages, name }: IConfig = (global as any).MODULE_CONFIG;
  const extraPageNameList: string[] | undefined = (global as any)
    .extraPageNameList;
  // 增量式添加
  const moduleNamePrefix = name.split("-")[0];
  if (extraPageNameList && extraPageNameList.length > 0) {
    try {
      let file = fs.readFileSync(pathFileName, { encoding: "utf-8" });
      for (const page of extraPageNameList) {
        const exportName = getConstName(page);
        file += `export const ${exportName} = '/${moduleNamePrefix}/${page}'\n`;
      }
      return file;
    } catch (error) {
      console.log(
        chalk.red("Error happend when add extra page in: ", pathFileName)
      );
    }
  } else {
    let result = `export const MODULE_INDEX = '/${moduleNamePrefix}'\n`;
    for (const page of pages) {
      const exportName = getConstName(page);
      result += `export const ${exportName} = '/${moduleNamePrefix}/${page}'\n`;
    }
    return result;
  }
  return "";
}

function getRouteList(pages: string[]) {
  const { name }: IConfig = (global as any).MODULE_CONFIG;
  const pageModuleName = getPascalCaseName(name);
  const routeList = pages.map((page) => {
    const path = getConstName(page);
    const componentName = getPascalCaseName(page);
    return `{
  path: ${path},
  component: ${pageModuleName}.${componentName},
  title: '${page}',
  exact: true
},`;
  });
  return routeList;
}

function getRouteIndexPage(pathFileName: string) {
  const { name, pages }: IConfig = (global as any).MODULE_CONFIG;
  const extraPageNameList: string[] | undefined = (global as any)
    .extraPageNameList;
  // 增量式添加
  if (extraPageNameList && extraPageNameList.length > 0) {
    try {
      let file = fs.readFileSync(pathFileName, { encoding: "utf-8" });
      // 1. 从path.ts中导入path
      file = file.replace(
        " } from './path'",
        `, ${extraPageNameList
          .map((page) => getConstName(page))
          .join(", ")} } from './path'`
      );
      // 2. 生成routeList
      const routeList = getRouteList(extraPageNameList);
      // 3. 把routeList插入到已有的列表中
      file = file.replace("routes: [", `routes: [\n${routeList.join("")}`);
      return file;
    } catch (error) {}
  } else {
    const pageModuleName = getPascalCaseName(name);
    const pathNameList = pages.map((page) => getConstName(page));
    const routeList = getRouteList(pages);
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
  return "";
}
// 路由配置 模块自动导出
// 纯字符串的操作方式，可能会存在问题
function addIndexImport(indexFilePath: string) {
  const { name }: IConfig = (global as any).MODULE_CONFIG;
  const importModuleName = getPascalCaseName(name);
  let newIndexFileStr = `import ${importModuleName} from './${name}'\n`;
  try {
    const file = fs.readFileSync(indexFilePath, { encoding: "utf-8" });
    // 如果已经导入了，则直接跳过
    if (file.includes(importModuleName)) {
      return;
    }
    newIndexFileStr += file;
    newIndexFileStr = newIndexFileStr.replace("]", `, ${importModuleName}]`);
    fs.writeFileSync(indexFilePath, newIndexFileStr);
    logModifyFile(indexFilePath);
  } catch (error) {
    console.log(
      chalk.red("Error happend when modify file:", indexFilePath, error)
    );
  }
}

// 思考：如果知道当前新增的page route?

export default function generateRoutes() {
  const {
    routeConfigPath,
    routeModulePathFileName,
    routeModuleConfigFileName,
    routeConfigIndexPath,
  } = paths;
  const extraPageNameList: string[] | undefined = (global as any)
    .extraPageNameList;
  const isAppend = extraPageNameList && extraPageNameList.length > 0;
  const afterGenerate = beforeGenerate(routeConfigPath, "route");
  if (!afterGenerate) {
    return;
  }
  // 创建path.ts
  if (moduleHasPages()) {
    fs.writeFileSync(
      routeModulePathFileName,
      getRoutePaths(routeModulePathFileName)
    );

    isAppend
      ? logModifyFile(routeModulePathFileName)
      : logGenerateFile(routeModulePathFileName);
  }
  // 创建index.ts
  fs.writeFileSync(
    routeModuleConfigFileName,
    prettier.format(getRouteIndexPage(routeModuleConfigFileName), {
      parser: "babel-ts",
      singleQuote: true,
      semi: false,
      printWidth: 130,
    })
  );
  isAppend
    ? logModifyFile(routeModuleConfigFileName)
    : logGenerateFile(routeModuleConfigFileName);
  addIndexImport(routeConfigIndexPath);
  afterGenerate();
}
