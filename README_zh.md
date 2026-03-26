[English](./README.md) | [中文](./README_zh.md)

# Solscan Jito Bundle Detector 是什么

Solscan Jito Bundle Detector 是一个基于 Chrome 的 Jito 插件（作为 Chrome 扩展程序），当在 solscan.io 上滑动（swipe）交易链接时，它会自动检测该交易是否在 Jito 上链。

# Solscan Jito Bundle Detector 安装指南

Solscan Jito Bundle Detector 是一个开源 Chrome 扩展程序，发布在 GitHub： [https://github.com/0slot-trade/checktx_v2](https://github.com/0slot-trade/checktx_v2)。请按照以下步骤从源代码直接安装扩展。

## 前置要求

- 电脑上已安装 Google Chrome 浏览器。
- 电脑上已安装 Git（可选，但推荐使用）。

## 安装步骤

1. **获取源代码：**
   - **方式一：使用 Git 克隆仓库**
     - 打开终端或命令提示符。
     - 运行以下命令：`git clone https://github.com/0slot-trade/checktx_v2.git`
     - 这将创建一个名为 `checktx_v2` 的目录，其中包含源代码。
   - **方式二：下载仓库为 ZIP 文件**
     - 访问 [https://github.com/0slot-trade/checktx_v2](https://github.com/0slot-trade/checktx_v2)。
     - 点击 "Code" 按钮。
     - 选择 "Download ZIP"。
     - 将下载的 ZIP 文件解压到你选择的目录。

2. **将扩展加载到 Chrome：**
    - 打开 Google Chrome。
    - 在地址栏输入 `chrome://extensions/`，按回车。
    - 点击右上角的开关，开启"开发者模式"。
    - 点击"加载已解压的扩展程序"按钮。
    - 导航到你克隆或解压源代码的目录（例如 `checktx_v2`）。
    - 选择该目录，点击"打开"（或"选择文件夹"）。

3. **验证安装：**
    - Solscan Jito Bundle Detector 扩展程序应出现在你的扩展列表中。
    - 你可以将扩展固定到工具栏，方便访问。
    - 访问 solscan.io，打开交易页面或悬停在交易链接上时即可看到效果。

## 注意事项

  - 无需安装额外依赖。
  - 无需编译源代码，可以直接加载。
