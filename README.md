<div align="center">

# Codex-Switch-Tauri2

**Windows 桌面端 Codex 配置管理与一键切换工具**

[![Version](https://img.shields.io/badge/版本-v1.3.0-blue)](#)
[![Platform](https://img.shields.io/badge/平台-Windows%20x64-informational)](#)
[![License](https://img.shields.io/badge/许可证-MIT-green)](LICENSE)
[![Tech](https://img.shields.io/badge/技术栈-Tauri%202%20%2B%20React%20%2B%20Rust-orange)](#技术栈)

> 在 Windows 上管理多套 Codex 配置，一键切换至 Windows 或 WSL 目标，切换前自动备份、随时可恢复，内置连接测试、模板编辑与 session 迁移。

</div>

---

## 目录

- [Codex-Switch-Tauri2](#codex-switch-tauri2)
  - [目录](#目录)
  - [软件简介](#软件简介)
  - [功能一览](#功能一览)
  - [新手使用指南](#新手使用指南)
    - [第一步：安装软件](#第一步安装软件)
    - [第二步：创建配置档案](#第二步创建配置档案)
    - [第三步：配置切换目标](#第三步配置切换目标)
    - [第四步：切换配置](#第四步切换配置)
    - [第五步：查看备份与恢复](#第五步查看备份与恢复)
    - [常见问题](#常见问题)
  - [安装方式](#安装方式)
    - [直接安装（推荐）](#直接安装推荐)
  - [开发者构建](#开发者构建)
    - [前置要求](#前置要求)
    - [本地开发](#本地开发)
    - [仅构建前端](#仅构建前端)
    - [打包 Windows 安装包](#打包-windows-安装包)
  - [文件存储位置](#文件存储位置)
  - [隐私与数据安全](#隐私与数据安全)
  - [技术栈](#技术栈)
  - [仓库结构](#仓库结构)
  - [测试与验证](#测试与验证)
  - [CI / CD](#ci--cd)
  - [致谢](#致谢)
  - [许可证](#许可证)

---

## 软件简介

Codex Switch 是一款运行在 Windows 上的桌面工具，专为需要频繁切换 [OpenAI Codex CLI](https://github.com/openai/codex) 配置的开发者设计。

Codex CLI 将认证信息存储在 `~/.codex/auth.json`，将模型与 provider 配置存储在 `~/.codex/config.toml`。当你需要在多个 API Key、多个 Base URL 或多个 provider 之间来回切换时，手动修改这些文件既繁琐又容易出错。

Codex Switch 解决了这个问题：你只需提前创建好若干套"配置档案（Profile）"，切换时一键完成，工具会在写入前自动备份，出问题随时回滚。

---

## 功能一览

| 功能模块 | 说明 |
|----------|------|
| **配置档案管理** | 增删改查、复制多套 Profile，支持 OpenAI 类型与 API Key 类型 |
| **一键切换** | 将选定 Profile 写入 Windows 目标、WSL 目标或两者同时写入 |
| **自动备份** | 每次切换前自动备份当前配置，支持按目标筛选、一键恢复 |
| **连接测试** | 使用档案内的 Base URL + API Key 发起真实请求，验证连通性 |
| **模板编辑** | 可编辑 OpenAI 与 API Key 两套 `config.toml` 模板，支持 `{base_url}` 占位变量与恢复默认值 |
| **Session 迁移** | 切换时批量更新最近 N 天的 `sessions` 文件首行及 `state_5.sqlite` 中的 `threads.model_provider` |
| **WSL 自动识别** | 自动检测默认 WSL 发行版、用户名及 home 目录，结果本地缓存并后台刷新 |
| **日志中心** | 查看历次切换与操作的详细执行日志 |

---

## 新手使用指南

### 第一步：安装软件

前往 [Releases 页面](../../releases) 下载最新版的 `.exe`（NSIS 安装包），双击运行完成安装。

> **最低系统要求**：Windows 10 x64 或 Windows 11 x64。

---

### 第二步：创建配置档案

打开软件后，点击左侧导航栏的**「配置档案」**页面，点击**「新建 Profile」**按钮。

填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| **名称** | 便于识别的档案名称 | `My API` |
| **Provider 类型** | 选择 `OpenAI` 或 `API Key` | `API Key` |
| **Base URL** | 你的 API 服务地址（可选） | `https://api.example.com/v1` |
| **API Key** | 对应的密钥（本地加密存储） | `sk-xxxxxxxx` |
| **测试模型** | 连接测试时使用的模型名（可选） | `gpt-4o` |

填好后点击**「保存」**。

---

### 第三步：配置切换目标

点击左侧导航栏的**「设置」**页面，根据你的实际情况配置：

- **写入 Windows 目标**：勾选后，切换时将更新 `%USERPROFILE%\.codex\` 下的文件。
- **写入 WSL 目标**：勾选后，切换时同步更新 WSL 内的 `.codex` 目录。
  - 如果使用了非默认的 WSL 发行版，可在此手动指定发行版名称和用户名。
- **Session 迁移天数**：设为 `0` 可跳过 session 迁移；建议设为 `7`（迁移最近 7 天的 session）。

---

### 第四步：切换配置

在左侧导航栏选择**「切换」**页面：

1. 在侧边栏的 Profile 列表中点击选中你想切换到的档案。
2. 右侧面板会显示**预检信息**：包括目标路径、将要写入的配置内容等。
3. 确认无误后，点击**「执行切换」**按钮。

切换完成后，你的 `auth.json` 和 `config.toml` 将被更新为所选档案的内容，原有配置会自动备份。

---

### 第五步：查看备份与恢复

若切换后发现问题，点击左侧导航栏的**「备份」**页面：

- 可按 Windows 或 WSL 目标筛选历史备份。
- 找到想要恢复的备份条目，点击**「恢复」**即可将配置回滚到备份时的状态。

---

### 常见问题

**Q：切换后 Codex CLI 提示认证失败？**  
A：请检查 Profile 中填写的 API Key 是否正确，或使用「配置档案」页面的**连接测试**功能验证。

**Q：WSL 目标写入失败？**  
A：请确认 WSL 已安装并至少有一个可用发行版；若使用了非默认发行版，需在「设置」中手动指定名称。

**Q：担心 API Key 明文存储不安全？**  
A：API Key 在本地使用 Windows DPAPI（数据保护 API）加密存储，不会以明文形式写入磁盘，也不会上传至任何服务器。详见[隐私与数据安全](#隐私与数据安全)。

**Q：如何彻底卸载？**  
A：通过 Windows「添加或删除程序」卸载本软件。程序数据位于 `%LOCALAPPDATA%\codex-switch\`，备份位于 `%USERPROFILE%\codex-switch-backups\`，如需完全清除请手动删除这两个目录。

---

## 安装方式

### 直接安装（推荐）

前往 [GitHub Releases](../../releases) 页面下载最新版本：

| 安装包 | 适用场景 |
|--------|----------|
| `Codex-Switch_x.x.x_x64-setup.exe` | NSIS 安装包，标准 Windows 安装向导 |

---

## 开发者构建

### 前置要求

**Node.js 环境**

- Node.js ≥ 18
- npm ≥ 9

**Rust 与 MSVC 工具链**（编译 Tauri 时必须）

Tauri 2 在 Windows 上依赖完整的 MSVC C++ 工具链：

1. 安装 [Visual Studio 2019 Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2019) 或完整版 Visual Studio 2019。
2. 在安装时勾选工作负载：**使用 C++ 的桌面开发**（Desktop development with C++）。
3. 确保包含以下组件：
   - MSVC 工具集（`VC\Tools\MSVC\<version>\include` 及 `lib\x64`）
   - Windows 10 / 11 SDK

> **注意**：若环境仅存在 `onecore` 库而缺少标准 `lib\x64`，`tauri dev` 会在 `tauri-build` 阶段报错，属于环境配置问题，与本项目代码无关。

4. 安装 Rust 工具链：

```bash
# 安装 rustup（若尚未安装）
winget install Rustlang.Rustup
# 或前往 https://rustup.rs 下载安装
```

---

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/<owner>/codex-switch.git
cd codex-switch

# 安装前端依赖
npm install

# 启动开发模式（需要 Rust + MSVC 环境）
npm run tauri dev
```

### 仅构建前端

```bash
# 不需要 Rust 环境，仅编译前端
npm run build
```

### 打包 Windows 安装包

```bash
# 输出 NSIS (.exe) 安装包
npm run build:windows
```

产物位于 `src-tauri/target/release/bundle/`。

---

## 文件存储位置

所有数据文件均存储在用户本地，**不涉及任何云端上传或远程同步**。

| 用途 | 路径 |
|------|------|
| Codex 配置（Windows） | `%USERPROFILE%\.codex\` |
| Codex 配置（WSL） | `/home/<用户名>/.codex/`（通过 `\\wsl$\<发行版>` 访问） |
| 自动备份目录 | `%USERPROFILE%\codex-switch-backups\` |
| 本工具配置与数据 | `%LOCALAPPDATA%\codex-switch\`（含 `profiles.json`、`profiles\`、`templates\`） |

---

## 隐私与数据安全

- **API Key 加密存储**：所有 API Key 在落盘前使用 **Windows DPAPI**（Data Protection API）进行加密，密钥与当前 Windows 用户账户绑定，其他用户账户或系统无法解密。
- **数据不离本机**：本工具不内置任何遥测、统计或数据上报功能，所有数据均存储在本机用户目录下。
- **连接测试请求**：「连接测试」功能会向你在 Profile 中配置的 Base URL 发起网络请求，这是唯一的对外网络行为，且完全由你控制目标地址。
- **日志内容**：日志文件记录操作步骤与结果，不记录 API Key 明文。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| **前端框架** | React 19 · TypeScript · Vite |
| **UI 组件** | Tailwind CSS v4 · Radix UI · shadcn/ui |
| **路由 / 表单** | React Router v7 · React Hook Form · Zod |
| **状态管理** | Zustand |
| **桌面运行时** | Tauri 2 |
| **后端语言** | Rust 2021 |
| **数据库** | rusqlite（bundled SQLite） |
| **网络请求** | reqwest（rustls-tls） |
| **系统加密** | Windows DPAPI |
| **打包格式** | NSIS 安装包（Windows x64） |

---

## 仓库结构

```text
.
├── src/                    # React 前端源码
│   ├── app/                # 应用根组件
│   ├── components/         # 通用 UI 组件
│   ├── features/           # 各功能模块（配置档案、切换、备份、日志等）
│   ├── hooks/              # 自定义 React Hooks
│   ├── lib/                # Tauri API 封装和工具函数
│   ├── pages/              # 页面级组件
│   ├── store/              # 全局状态管理
│   └── types/              # TypeScript 类型定义
├── src-tauri/              # Rust 后端源码（Tauri 命令、服务、模型）
├── tooling/                # 构建辅助脚本与工程工具
│   └── scripts/            # 构建辅助脚本
├── tests/
│   └── frontend/           # 前端自动化测试（Vitest）
└── docs/                   # 补充文档
```

---

## 测试与验证

```bash
# 前端单元测试（Vitest）
npm run test

# 前端测试（监听模式，开发时使用）
npm run test:watch

# Rust 单元测试（需要 MSVC 环境）
npm run test:rust

# Rust 类型检查
npm run check:rust

# 完整验证链（前端测试 + TS 类型检查 + Rust 测试 + 敏感路径检查）
npm run verify
```

---

## CI / CD

提交 Pull Request 时，GitHub Actions 会自动执行前端校验、Windows Rust 校验，并构建 Windows NSIS 安装包。

推送任意分支提交时：

- 工作流会校验并构建 Windows NSIS 安装包，产物上传为 Actions artifact，便于每次提交都能回归验证。
- 前端 `dist` 会先在 Ubuntu 构建并复用到 Windows 打包阶段，避免在 Tauri 构建时重复执行 Vite 生产构建。

推送 `v*` 标签时：

- 工作流会在上述构建全部通过后创建或更新对应的 GitHub Release，并上传同一份 NSIS 安装包作为附件。
- 标签名必须与 `package.json` 版本一致，例如 `package.json` 为 `1.3.0` 时，需要推送 `v1.3.0`。

工作流文件：`.github/workflows/windows-tauri-release.yml`

---

## 致谢

本项目的设计思路与功能方向参考并继承自 [54xzh/codex-switch](https://github.com/54xzh/codex-switch)，感谢原项目作者的开源分享与启发。

---

## 许可证

本项目基于 [MIT License](LICENSE) 开源发布。
