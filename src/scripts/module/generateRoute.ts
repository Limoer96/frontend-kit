import path from "path";
import fs from "fs";
import chalk from "chalk";
import prettier from "prettier";
import { IConfig } from "./typing";
import {
  beforeGenerate,
  getConstName,
  getPascalCaseName,
  logGenerateFile,
} from "./utils";

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

function moduleHasPages() {
  const { pages, name }: IConfig = (global as any).MODULE_CONFIG;
  return name && pages && pages.length > 0;
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

export default function generateRoutes() {
  const config: IConfig = (global as any).MODULE_CONFIG;
  const routePath = config.routePath || "./src/router/config"; // config dir
  const basePath = path.resolve(process.cwd(), routePath); // absolute path at config
  const modulePath = path.join(basePath, config.name); // module absolute path
  const routeFileName = path.join(modulePath, "index.ts");
  const pathFileName = path.join(modulePath, "path.ts");

  // 如果是增量式，直接结束
  if (warnIfModelGenerated(modulePath)) {
    return;
  }

  const afterGenerate = beforeGenerate(basePath, "route");
  if (!afterGenerate) {
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
