import chalk from "chalk";
import fs from "fs";
import path from "path";
import { IConfig } from "./typing";

export function getNodejsMainVersion() {
  const versionStr = process.version;
  const versionArr = versionStr.substring(1).split(".");
  const mainVersion = Number(versionArr[0]);
  if (Number.isNaN(mainVersion)) {
    return -1;
  }
  return mainVersion;
}

export function logGenerateFile(filePath: string) {
  console.log("Create File: ", chalk.green(filePath));
}

export function logGenerateDir(filePath: string) {
  console.log("Create Dir: ", chalk.green(filePath));
}

export function beforeGenerate(basePath: string, type: string) {
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

export function getPascalCaseName(value: string) {
  return value
    .split("-")
    .map((word) => word[0].toUpperCase() + word.substr(1))
    .join("");
}

export function getConstName(value: string) {
  return value
    .split("-")
    .map((word) => word.toUpperCase())
    .join("_");
}
