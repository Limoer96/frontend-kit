import fsp from "fs/promises";
import fs from "fs";
import path from "path";
import { IConfig } from "./typing";
import {
  beforeGenerate,
  getPascalCaseName,
  logGenerateDir,
  logGenerateFile,
} from "./utils";

import paths from "./path";

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

// 路由配置Dir是否存在
const isModuleRoutePathExist = () => fs.existsSync(paths.routeModulePath);

function checkPageExistAndGenerate(currentPagePath: string, page: string) {
  const { name }: IConfig = (global as any).MODULE_CONFIG;
  const exist = fs.existsSync(currentPagePath);
  if (exist) {
    return;
  }
  if (isModuleRoutePathExist()) {
    // 把当次新增的页面保存下来
    const pageNameList: string[] | undefined = (global as any)
      .extraPageNameList;
    (global as any).extraPageNameList = pageNameList
      ? [...pageNameList, page]
      : [page];
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

export default function generatePage() {
  const { pages }: IConfig = (global as any).MODULE_CONFIG;
  const { pagePath, pageModulePath } = paths;
  const afterGenerate = beforeGenerate(pagePath, "page");
  if (!afterGenerate) {
    return;
  }
  // 只创建index.ts
  if (!pages || pages.length === 0) {
    const content = "export default {}";
    fsp.writeFile(path.join(pageModulePath, "index.ts"), content).then(() => {
      logGenerateFile(path.join(pageModulePath, "index.ts"));
    });
  } else {
    // 创建具体页面
    for (const page of pages) {
      const currentPagePath = path.join(pageModulePath, page); // 创建具体的页面目录
      checkPageExistAndGenerate(currentPagePath, page);
    }
    // 统一导出，无论是新生成还是增量
    fs.writeFileSync(
      path.join(pageModulePath, "index.ts"),
      getModuleIndexPage(pages)
    );
    logGenerateFile(path.join(pageModulePath, "index.ts"));
  }
  afterGenerate();
}
