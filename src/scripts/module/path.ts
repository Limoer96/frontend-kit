import chalk from "chalk";
import fs from "fs";
import path from "path";
import { CONFIG_PATH } from "./const";
import { IConfig } from "./typing";

const appDirPath = fs.realpathSync(process.cwd());

const resolveApp = (relativePath: string) =>
  path.resolve(appDirPath, relativePath);

let config: undefined | string | IConfig;

try {
  config = fs.readFileSync(CONFIG_PATH, { encoding: "utf-8" });
  config = JSON.parse(config);
} catch (error) {
  console.log(
    chalk.red("Error Happend when reading file:", CONFIG_PATH, error)
  );
  process.exit(1);
}

const { name, routePath, pagePath } = config as IConfig;

const routeRelativePath = routePath || "./src/router/config";
const routeConfigIndexPath = `${routeRelativePath}/index.ts`;
const routeModuleRelativePath = `${routeRelativePath}/${name}`;
const routeModuleRoutePath = `${routeModuleRelativePath}/index.ts`;
const routeModulePath = `${routeModuleRelativePath}/path.ts`;

const pageRelativePath = pagePath || "./src/pages";
const pageModuleRelativePath = `${pageRelativePath}/${name}`;

export default {
  appDir: resolveApp("."),
  routeConfigIndexPath: resolveApp(routeConfigIndexPath),
  routeConfigPath: resolveApp(routeRelativePath),
  routeModulePath: resolveApp(routeModuleRelativePath),
  routeModuleConfigFileName: resolveApp(routeModuleRoutePath),
  routeModulePathFileName: resolveApp(routeModulePath),
  pagePath: resolveApp(pageRelativePath),
  pageModulePath: resolveApp(pageModuleRelativePath),
};
