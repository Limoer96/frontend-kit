import chalk from "chalk";
import fsp from "fs/promises";
import { checkAndGenerateConfig } from "./checkAndGenerateConfig";
import { CONFIG_PATH } from "./const";
import { IConfig } from "./typing";
import { getNodejsMainVersion } from "./utils";
import generatePage from "./generatePage";
import generateRoutes from "./generateRoute";

function run() {
  fsp.readFile(CONFIG_PATH, "utf-8").then((_config: string) => {
    const config: IConfig = JSON.parse(_config);
    (global as any).MODULE_CONFIG = config;
    generatePage();
    generateRoutes();
  });
}

export default function genModule() {
  // check Node.js version
  const currentNodeVersion = getNodejsMainVersion();

  if (currentNodeVersion < 10) {
    console.log(
      chalk.red(
        `Your current Node.js version is ${currentNodeVersion}, genModule does not support Node.js version below 10!`
      )
    );
    return;
  }
  // check moduleConfig.json
  checkAndGenerateConfig()
    .then((continue_: boolean) => {
      if (continue_) {
        run();
      }
    })
    .catch((err) => {
      console.log(chalk.red("Error happend:", err));
    });
}
