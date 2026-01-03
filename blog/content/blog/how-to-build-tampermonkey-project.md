+++
title = "使用 Vite + TypeScript 搭建油猴项目"
date = 2025-11-28
description = "使用 Vite + TypeScript 搭建油猴项目"
[taxonomies]
tags = ["tampermonkey", "typescript", "vite", "web"]
[extra]
author = "Gemini"
+++

# 使用 Vite + TypeScript 搭建油猴项目

这里是一个从零开始的完整步骤：

## 1\. 准备环境

确保你已经安装了 [Node.js](https://nodejs.org/) (它会自带 npm)。

## 2\. 初始化 Vite 项目

我们将使用 Vite 的 `vanilla-ts` (原生 TS) 模板来创建一个新项目。

```bash
# 你可以使用 npm, pnpm 或 yarn
npm create vite@latest my-tampermonkey-script -- --template vanilla-ts
```

进入项目目录：

```bash
cd my-tampermonkey-script
```

## 3\. 安装依赖

你需要安装两个关键的开发依赖：

1.  **`vite-plugin-monkey`**: 核心插件，它会处理元数据注入、打包和热更新。
2.  **`@types/tampermonkey`**: Tampermonkey 的 TypeScript 类型定义，让你在编码时可以获得 `GM_...` 函数的智能提示。

<!-- end list -->

```bash
npm install vite-plugin-monkey @types/tampermonkey --save-dev
```

## 4\. 配置 Vite (vite.config.ts)

这是最关键的一步。打开项目根目录下的 `vite.config.ts` 文件，修改为以下内容：

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import monkey, { cdn } from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      // 插件入口文件
      entry: "src/main.ts",

      // 用户脚本的元数据
      userscript: {
        // 脚本名称
        name: "我的第一个TS油猴脚本",
        // 命名空间
        namespace: "http://tampermonkey.net/",
        // 版本
        version: "0.1.0",
        // 描述
        description: "使用 Vite + TS 编写的油猴脚本",
        // 作者
        author: "你",
        // 匹配的域名
        match: ["*://*.google.com/*"],
        // 脚本需要的权限
        // @grant 指令
        grant: ["GM_addStyle", "GM_getValue", "GM_setValue"],
      },

      // 配置构建
      build: {
        // （可选）将外部库（如 Vue, React）通过 CDN 引入，
        // 而不是打包到脚本中
        externalGlobals: {
          // vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
```

> **重要提示**：
>
> - `userscript` 对象中的字段会**自动生成**为 Tampermonkey 需要的 `// ==UserScript==` 头部。
> - 你需要在这里（`userscript.match`）指定脚本在哪个网站上运行。
> - 如果你用到了 `GM_` 开头的函数，**必须**在 `userscript.grant` 数组中声明它们。

## 5\. 配置 TypeScript (tsconfig.json)

为了让 TS 认识 Tampermonkey 的 API (如 `GM_addStyle`)，你需要将类型定义添加到 `tsconfig.json` 中。

打开 `tsconfig.json`，找到 `compilerOptions.types` 数组，在里面加入 `@types/tampermonkey`：

```json
{
  "compilerOptions": {
    // ... 其他选项 ...

    "types": ["vite/client", "@types/tampermonkey"] // <-- 添加在这里

    // ... 其他选项 ...
  }
}
```

## 6\. 编写你的脚本 (src/main.ts)

现在可以清空 `src/main.ts` 里的默认内容，开始编写你的油猴脚本了。

```typescript
// src/main.ts

// 这是一个 TypeScript 模块，我们可以在这里使用 import
import { log } from "./utils"; // 假设你有一个 utils.ts 文件

// ==UserScript==
// 注意：你不需要在这里写元数据块！
// vite-plugin-monkey 会自动从 vite.config.ts 生成它。
// ==/UserScript==

(function () {
  "use strict";

  console.log("你好，Tampermonkey + TypeScript!");

  // 使用你在 config.grant 中声明的 API
  // 你会发现 GM_addStyle 现在有代码提示了
  GM_addStyle(`
    body {
      background-color: #f0f0f0;
    }
  `);

  // 使用导入的模块
  log("脚本已加载");

  // 演示 GM_getValue 和 GM_setValue
  let runCount = GM_getValue("runCount", 0);
  console.log(`这个脚本已经运行了 ${runCount} 次`);
  GM_setValue("runCount", runCount + 1);
})();
```

## 7\. 开发与热更新 (最爽的一步)

1.  **启动开发服务器**：

    ```bash
    npm run dev
    ```

2.  **安装脚本**：
    Vite 会在终端显示一个本地服务器地址，类似 `http://localhost:5173/`。

    `vite-plugin-monkey` 会生成一个 "开发模式" 的脚本。你只需要访问这个地址，然后加上你的脚本文件名（通常是 `[项目名].user.js`）。

    在终端的输出中找到类似下面这行：
    `> Local: http://localhost:5173/my-tampermonkey-script.user.js`

    **复制这个 URL**，在浏览器中打开它。Tampermonkey 会弹出来，提示你安装这个脚本。**请点击安装**。

3.  **体验热更新**：

    - 你刚才安装的 "开发脚本" 实际上是一个“加载器”，它会自动从你的本地 `localhost:5173` 服务器拉取最新的代码。
    - 现在，去你设置的 `match` 网站 (例如 `google.com`)。
    - 尝试修改你的 `src/main.ts` 文件 (比如改一下 `console.log` 的内容或 CSS 样式) 并**保存**。
    - **你不需要重新安装脚本**，只需要刷新 `google.com` 页面，就能立刻看到最新的修改！

## 8\. 构建生产环境脚本

当你完成了开发，准备把脚本分享给别人时，运行：

```bash
npm run build
```

Vite 会在 `dist` 文件夹中生成一个最终的 `.user.js` 文件 (例如 `dist/my-tampermonkey-script.user.js`)。这个文件已经打包了你所有的 TS 代码、注入了元数据，并且已经编译和压缩为纯 JS。

你只需要把这个 `dist` 目录下的 `.user.js` 文件拖到浏览器，或分享给他人，就可以永久安装了。
