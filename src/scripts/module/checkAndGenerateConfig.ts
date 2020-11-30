import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import { CONFIG_PATH } from "./const";
import { logGenerateFile } from "./utils";

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

export function checkAndGenerateConfig() {
  return new Promise((resolve) => {
    const exist = fs.existsSync(CONFIG_PATH);
    if (exist) {
      resolve(true);
    } else {
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
            resolve(false);
          }
        })
        .catch((err) => {
          console.log(chalk.red(`error happend: ${err}`));
          resolve(false);
        });
    }
  });
}
