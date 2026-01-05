# script-vsc

script-vsc 是一个 VS Code 扩展，提供如下功能：

## Features

- 状态栏显示多语言 Hello World 示例
- 快速页面跳转、上一页、下一页命令
- 状态栏点击弹出信息面板
- 支持 TypeScript/JavaScript/Vue 关键字悬停提示

## 安装

```bash
npm i
npm run compile
vsce package
```

## 使用方法

- 通过命令面板执行 `extension.displayCode`、`extension.getJumpingPage` 等命令
- 点击状态栏内容可弹出信息面板

## 已知问题

暂无

## 发布日志

### 1.0.0

- 初始版本

---

## build

```bash
npm i @vscode/vsce -g
vsce package
```
