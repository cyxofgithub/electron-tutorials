## 快速入门

本指南将指导你在 Electron 中创建一个基本的 Hello World 应用程序，与 [electron/electron-quick-start](https://github.com/electron/electron-quick-start) 类似。

本教程结束时，您的应用程序将打开一个浏览器窗口，显示一个包含 Chromium、Node.js 和 Electron 版本信息的网页。

## 必备条件

要使用 Electron，需要安装 Node.js。我们建议你使用最新的 LTS 版本。

> 请使用为您的平台预制的安装程序安装 Node.js。否则，您可能会遇到与不同开发工具不兼容的问题。

要检查 Node.js 安装是否正确，请在终端客户端键入以下命令：

```
node -v
npm -v
```

这些命令应相应地打印 Node.js 和 npm 的版本。

**注意：**由于 Electron 将 Node.js 嵌入其二进制文件，因此运行你代码的 Node.js 版本与你系统上运行的版本无关。

## 创建你的应用

### 项目脚手架

Electron 应用程序的一般结构与其他 Node.js 项目相同。首先创建一个文件夹并初始化一个 npm 包。

```
mkdir my-electron-app && cd my-electron-app
yarn init
```

yarn init 命令将提示您在配置中设置一些字段。在本教程中需要遵循一些规则：

-   入口应为 main.js。
-   author 和 description 可以是任何值，但对于应用程序打包来说是必要的。

您的 package.json 文件应该如下所示：

```javascript
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js",
  "author": "Jane Doe",
  "license": "MIT"
}
```

然后，将 electron 包到应用程序的 devDependencies 中：

```javascript
yarn add --dev electron
```

> 注：如果在安装 Electron 时遇到任何问题，请参阅[高级安装指南](https://www.electronjs.org/docs/latest/tutorial/installation)。

最后，你希望能够执行 Electron。在 package.json 配置的脚本字段中，像这样添加一条启动命令：

```javascript
{
  "scripts": {
    "start": "electron ."
  }
}
```

该启动命令可让您在开发模式下打开应用程序:

```javascript
yarn start
```

> 注意：该脚本会告诉 Electron 在项目根目录下运行。在此阶段，你的应用程序会立即抛出一个错误，告诉你它找不到要运行的应用程序。

### 运行主进程

任何 Electron 应用程序的入口都是它的主脚本。该脚本控制主进程，主进程在完整的 Node.js 环境中运行，负责控制应用程序的生命周期、显示本地界面、执行特权操作和管理呈现器进程（稍后详述）。

在执行过程中，Electron 会在应用程序 package.json 配置的主字段中查找该脚本，你应该在应用程序脚手架步骤中配置了该配置。

要初始化主脚本，请在项目根文件夹中创建一个名为 main.js 的空文件。

> 注意：如果此时再次运行启动脚本，应用程序将不再出现任何错误！不过，它还不会做任何事情，因为我们还没有在 main.js 中添加任何代码。

### 创建一个 web 页面

在为应用程序创建窗口之前，我们需要创建加载到窗口中的内容。在 Electron 中，每个窗口都会显示网络内容，这些内容可以从本地 HTML 文件或远程 URL 加载。

本教程将采用前者。在项目的根文件夹中创建一个 index.html 文件：

```javascript
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <!-- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using Node.js <span id="node-version"></span>,
    Chromium <span id="chrome-version"></span>,
    and Electron <span id="electron-version"></span>.
  </body>
</html>
```

> 注：查看此 HTML 文档，可以发现正文中缺少版本号。我们稍后将使用 JavaScript 手动插入它们。

### 在浏览器窗口中打开网页

有了网页后，将其加载到应用程序窗口中。为此，你需要两个 Electron 模块：

-   app 模块，用于控制应用程序的事件生命周期。
-   BrowserWindow 模块，用于创建和管理应用程序窗口。

由于主进程运行的是 Node.js，因此您可以在 main.js 文件顶部将这些模块作为 CommonJS 模块导入：

```javascript
const { app, BrowserWindow } = require("electron");
```

然后，添加一个 createWindow() 函数，将 index.html 加载到一个新的 BrowserWindow 实例中。

```javascript
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    win.loadFile("index.html");
};
```

接下来，调用 createWindow() 函数打开窗口。

在 Electron 中，浏览器窗口只能在应用程序模块的就绪事件触发后创建。您可以使用 app.whenReady() API 等待该事件。在 whenReady() resolve 其 Promise 之后调用 createWindow()。

```javascript
app.whenReady().then(() => {
    createWindow();
});
```

> 注意：此时，你的 Electron 应用程序应能成功打开一个显示网页的窗口！

### 管理窗口的生命周期

虽然你现在可以打开浏览器窗口，但你还需要一些额外的模板代码，才能让它在每个平台上更有原生感。应用程序窗口在每个操作系统上的表现都不同，Electron 要求开发人员在应用程序中实现这些约定。

一般来说，你可以使用进程全局的[平台](https://nodejs.org/api/process.html#process_process_platform)属性来运行专门针对某些操作系统的代码。\

**关闭所有窗口时退出应用程序（Windows 和 Linux）**

在 Windows 和 Linux 系统中，退出所有窗口通常会完全退出应用程序。

要实现这一点，需要监听 app 模块的 "window-all-closed "事件，如果用户不在 macOS (darwin) 上，则调用 app.quit()。

```javascript
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
```

### 在未打开窗口的情况下打开一个窗口（macOS）

Linux 和 Windows 应用程序会在没有窗口打开时退出，而 macOS 应用程序通常会在没有窗口打开的情况下继续运行，在没有窗口可用时激活应用程序会打开一个新窗口。

要实现这一功能，需要监听应用程序模块的 [activate](https://www.electronjs.org/docs/latest/api/app#event-activate-macos) 事件，如果没有打开浏览器窗口，则调用现有的 createWindow() 方法。

由于窗口不能在就绪事件发生前创建，因此只能在应用程序初始化后监听激活事件。为此，您可以在现有的 whenReady() 回调中附加事件监听器。

```javascript
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
```

> 注意：此时，您的窗口控件应已完全正常运行！

## 通过预加载脚本从渲染器(renderer)访问 Node.js

现在，要做的最后一件事就是将 Electron 及其依赖程序的版本号打印到你的网页上。

在主进程中，通过 Node 的全局进程对象访问这些信息非常容易。但是，你不能在主进程中编辑 DOM，因为主进程无法访问渲染器的文档上下文。它们处于完全不同的进程中！

> 注：如果您需要更深入地了解 Electron 进程，请参阅[进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)文件。

这时，为渲染器附加预加载脚本就派上用场了。预加载脚本在加载渲染器进程之前运行，可以访问渲染器全局（如 window 和 document）和 Node.js 环境。

创建一个名为 preload.js 的新脚本：

```javascript
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
```

上述代码访问 Node.js process.versions 对象，并运行一个基本的 replaceText 辅助函数，将版本号插入 HTML 文档。

要将此脚本附加到渲染器进程，请将预加载脚本的路径传入现有 BrowserWindow 构造函数中的 webPreferences.preload 选项。

```javascript
const { app, BrowserWindow } = require("electron");
// include the Node.js 'path' module at the top of your file
const path = require("node:path");

// modify your existing createWindow() function
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    win.loadFile("index.html");
};
// ...
```

这里使用了两个 Node.js 概念：

-   这个 \_\_dirname 字符串指向当前执行脚本的路径（本例中为项目根目录）。
-   path.join API 将多个路径段连接在一起，创建一个可在所有平台上使用的组合路径字符串。

我们使用与当前执行的 JavaScript 文件相对的路径，这样您的相对路径在开发模式和打包模式下都能正常工作。

### 奖励(Bonus)：为您的网页内容添加功能

此时，您可能会想知道如何为应用程序添加更多功能。

要与网页内容进行任何交互，都需要在渲染器进程中添加脚本。由于渲染器在正常的网络环境中运行，因此您可以在 index.html 文件的结尾 </body> 标签前添加 <script> 标签，以包含您想要的任意脚本：

```javascript
<script src="./renderer.js"></script>
```

然后，renderer.js 中包含的代码可以使用与典型前端开发相同的 JavaScript API 和工具，例如使用 webpack 来捆绑和精简代码，或使用 React 来管理用户界面。

## 回顾(Recap)

总结一下我们所做的所有步骤：

我们启动了一个 Node.js 应用程序，并将 Electron 添加为依赖项。

我们创建了一个运行主进程的 main.js 脚本，该进程控制我们的应用程序，并在 Node.js 环境中运行。在该脚本中，我们使用 Electron 的 app 和 BrowserWindow 模块创建了一个浏览器窗口，在独立进程（渲染器）中显示网页内容。

为了访问渲染器中的某些 Node.js 功能，我们在 BrowserWindow 构造函数中附加了一个预加载脚本。

## 打包和发布应用程序

发布新创建应用程序的最快方法是使用 [Electron Forge](https://www.electronforge.io/)。

> 要为 Linux 构建 RPM 软件包，需要安装其所需的系统依赖项。

1、在 package.json 文件中添加 description，否则 rpmbuild 将失败。description 为空无效。
2、将 Electron Forge 添加为应用程序的开发依赖项，并使用其导入命令设置 Forge 的脚手架：

```bash
yarn add --dev @electron-forge/cli
npx electron-forge import

✔ Checking your system
✔ Initializing Git Repository
✔ Writing modified package.json file
✔ Installing dependencies
✔ Writing modified package.json file
✔ Fixing .gitignore

We have ATTEMPTED to convert your app to be in a format that electron-forge understands.

Thanks for using "electron-forge"!!!
```

3、使用 Forge 的 make 命令创建可分发文件：

```bash
yarn make

> my-electron-app@1.0.0 make /my-electron-app
> electron-forge make

✔ Checking your system
✔ Resolving Forge Config
We need to package your application before we can make it
✔ Preparing to Package Application for arch: x64
✔ Preparing native dependencies
✔ Packaging Application
Making for the following targets: zip
✔ Making for target: zip - On platform: darwin - For arch: x64
```

Electron Forge 会创建一个输出文件夹，存放你的软件包：

```bash
// Example for macOS
out/
├── out/make/zip/darwin/x64/my-electron-app-darwin-x64-1.0.0.zip
├── ...
└── out/my-electron-app-darwin-x64/my-electron-app.app/Contents/MacOS/my-electron-app
```
