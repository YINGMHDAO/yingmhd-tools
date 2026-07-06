<div align="center">

# YINGMHD Tools

**一款 macOS / Windows 通用的开发者工具启动器,类 uTools 的插件化桌面效率工具**

基于 Tauri 2 + React 19 构建,轻量、快速、可扩展

![License](https://img.shields.io/badge/license-MIT-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8DB?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)
![npm](https://img.shields.io/npm/v/yingmhd-tools?logo=npm)
![Release](https://img.shields.io/github/v/release/YINGMHDAO/yingmhd-tools?logo=github)

</div>

---

## ✨ 特性

- ⌨️ **全局快捷键唤起** — 默认 `Option+Space`(macOS)/ `Alt+Space`(Windows),随时呼出,快捷键可自定义
- 🔍 **模糊搜索** — 基于 Fuse.js,输入关键词即可快速定位插件与命令
- 🧩 **插件化架构** — 所有功能以插件形式组织,新增工具只需实现 `Plugin` 接口
- 🪟 **无边框毛玻璃界面** — 透明窗口 + 系统级 vibrancy / acrylic 效果,支持拖拽移动
- 🌗 **深浅主题** — 跟随系统 / 浅色 / 深色三档切换
- 📌 **托盘常驻** — 关闭即隐藏,左键单击托盘切换显隐,单实例运行
- 👻 **失焦自动隐藏** — 像 uTools 一样点击窗口外即收起(可在设置中关闭)
- 🚀 **轻量原生** — Tauri 2 打包,体积与内存占用远小于 Electron 方案

## 🧰 内置插件

| 插件 | 说明 | 功能 |
|------|------|------|
| **JSON Editor** | 基于 Monaco Editor 的 JSON 工具 | 格式化、压缩、校验 JSON 数据 |
| **Port Manager** | 系统端口管理 | 扫描监听端口、查看占用进程(名称/PID)、一键结束进程 |

## 📦 安装

> 当前发布版本为 macOS(Apple Silicon)。Windows / Intel Mac 用户请参考下方[从源码构建](#-快速开始),多平台产物在 Roadmap 中。

### 方式一:Homebrew(推荐)

```bash
# 安装(会自动添加 yingmhdao/tap 仓库)
brew install --cask yingmhdao/tap/yingmhd-tools

# 卸载
brew uninstall --cask yingmhd-tools
```

> 较新版本的 Homebrew 首次使用第三方仓库时会提示确认,按提示执行 `brew trust yingmhdao/tap` 后重新安装即可。

### 方式二:DMG 安装包

从 [GitHub Releases](https://github.com/YINGMHDAO/yingmhd-tools/releases) 下载最新的 `.dmg`,打开后将应用拖入 `Applications` 文件夹。卸载时直接将应用从 `Applications` 拖入废纸篓即可。

> ⚠️ 应用暂未进行 Apple 签名公证,首次打开如提示「无法验证开发者」,请在应用图标上**右键 → 打开**,或执行 `xattr -cr /Applications/yingmhd-tools.app` 后再打开。

### 方式三:npm

```bash
# 安装
npm install -g yingmhd-tools

# 启动(安装后在终端执行)
yingmhd-tools

# 卸载
npm uninstall -g yingmhd-tools
```

安装完成后按 `Option+Space` 即可唤起窗口。

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+ 与 npm
- [Rust](https://www.rust-lang.org/tools/install) 1.77.2+
- 平台依赖(详见 [Tauri 官方文档](https://tauri.app/start/prerequisites/)):
  - **macOS**:Xcode Command Line Tools(`xcode-select --install`)
  - **Windows**:Microsoft C++ Build Tools、WebView2 Runtime(Win10 1803+ 已内置)

### 开发运行

```bash
# 克隆项目
git clone git@github.com:YINGMHDAO/yingmhd-tools.git
cd yingmhd-tools

# 安装依赖
npm install

# 启动开发模式(自动拉起前端 dev server 与 Tauri 窗口)
npm run tauri:dev
```

### 打包构建

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`(macOS 为 `.app` / `.dmg`,Windows 为 `.msi` / `.exe`)。

### 其他脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 仅启动前端 Vite dev server(浏览器调试 UI) |
| `npm run build` | 前端类型检查 + 产物构建 |
| `npm run lint` | 运行 oxlint 代码检查 |

## 📖 使用说明

| 操作 | 行为 |
|------|------|
| `Option+Space` / `Alt+Space` | 显示 / 隐藏主窗口(可在设置中修改) |
| `Esc` | 隐藏窗口 |
| `↑` `↓` + `Enter` | 在搜索结果中选择并打开插件 |
| 点击窗口外部 | 窗口自动隐藏(失焦隐藏,可在设置中关闭) |
| 点击关闭按钮 | 隐藏窗口(应用保持托盘常驻) |
| 左键单击托盘图标 | 切换窗口显隐 |
| 托盘菜单「退出程序」 | 完全退出应用 |

**设置页**(托盘菜单「设置」或 Dashboard 进入)支持:

- **外观**:主题跟随系统 / 浅色 / 深色
- **快捷键**:录制修改全局快捷键(自动检测冲突并回滚)、恢复默认、启用开关
- **通用**:失焦自动隐藏开关

## 🔌 开发插件

插件是本项目的核心扩展方式。一个插件 = 一个 `Plugin` 对象 + 一个页面组件(可选)+ 若干命令(可选)。

### Plugin 接口

类型定义位于 [`src/types/index.ts`](src/types/index.ts),可从 `@/plugin` 导入:

```ts
/** 插件接口 */
export interface Plugin {
  id: string;           // 唯一标识,如 'json-editor'
  name: string;         // 显示名称
  description: string;  // 一句话描述(展示在搜索结果与 Dashboard)
  icon: string;         // Lucide 图标名,如 'Braces'、'Network'
  version: string;      // 插件版本
  enabled: boolean;     // 是否启用
  keywords: string[];   // 搜索关键词(支持中英文)
  route?: string;       // 插件页面路由,如 '/json-editor'
  page?: ComponentType; // 页面组件(预留字段,当前路由为静态挂载)
  commands?: Command[]; // 插件提供的命令列表
  aiEnabled?: boolean;  // AI 能力开关(预留)
}

/** 命令接口 */
export interface Command {
  id: string;
  title: string;
  keywords: string[];
  run(input?: string): Promise<void> | void;
}
```

### 四步创建一个插件

下面以「时间戳转换」插件为例。

**① 创建插件定义** — `src/plugins/timestamp/index.ts`:

```ts
import type { Plugin } from '@/plugin';

export const timestampPlugin: Plugin = {
  id: 'timestamp',
  name: 'Timestamp',
  description: '时间戳与日期互相转换',
  icon: 'Clock',
  version: '1.0.0',
  enabled: true,
  keywords: ['timestamp', 'time', 'date', '时间戳', '时间'],
  route: '/timestamp',
  aiEnabled: false,
};
```

如需在启动器中直接搜索到插件内的动作,可再建 `commands.ts`(参考 [`src/plugins/json-editor/commands.ts`](src/plugins/json-editor/commands.ts)):

```ts
import type { Command } from '@/plugin';

export const timestampCommands: Command[] = [
  {
    id: 'timestamp-now',
    title: '获取当前时间戳',
    keywords: ['now', 'timestamp', '当前时间'],
    run: () => {
      window.location.hash = '#/timestamp';
    },
  },
];
```

**② 创建页面组件** — `src/pages/Timestamp.tsx`:

页面结构可参考现有插件页(如 [`src/pages/PortManager.tsx`](src/pages/PortManager.tsx)):顶部 `<header data-tauri-drag-region>` 导航栏(含返回按钮),下方为插件内容区。

**③ 注册路由** — 在 [`src/App.tsx`](src/App.tsx) 中添加:

```tsx
<Route path="/timestamp" element={<TimestampPage />} />
```

> 说明:当前版本路由为静态挂载,`Plugin.page` 字段暂未被消费,因此需要手动在 `App.tsx` 中添加一行路由。

**④ 注册插件** — 在 [`src/main.tsx`](src/main.tsx) 中:

```tsx
import { timestampPlugin } from '@/plugins/timestamp';

pluginManager.register(timestampPlugin);
```

完成后 `npm run tauri:dev`,在启动器输入 `time` 或 `时间戳` 即可搜到新插件。

### 需要系统能力?添加 Rust 命令

前端无法直接执行系统操作(读进程、杀进程等),需通过 Tauri command 调用 Rust。以 Port Manager 为例:

**① 编写命令** — `src-tauri/src/commands/` 下新建模块(参考 [`src-tauri/src/commands/port.rs`](src-tauri/src/commands/port.rs)):

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]  // 注意:与前端 TS 类型的驼峰命名对齐
pub struct PortInfo {
    pub port: u16,
    pub pid: u32,
    pub process_name: String,
}

#[tauri::command]
pub async fn get_ports() -> Result<Vec<PortInfo>, String> { /* ... */ }
```

**② 注册命令** — 在 [`src-tauri/src/lib.rs`](src-tauri/src/lib.rs) 的 `invoke_handler` 中添加:

```rust
.invoke_handler(tauri::generate_handler![
    commands::port::get_ports,
    // ...
])
```

**③ 前端调用**:

```ts
import { invoke } from '@tauri-apps/api/core';

const ports = await invoke<PortInfo[]>('get_ports');
```

如用到窗口、事件等 Tauri 内置能力,还需在 [`src-tauri/capabilities/default.json`](src-tauri/capabilities/default.json) 中声明对应权限(如 `core:window:allow-start-dragging`)。

## 📁 项目结构

```
yingmhd-tools/
├── src/                        # React 前端
│   ├── main.tsx                # 入口 + 内置插件注册
│   ├── App.tsx                 # HashRouter 路由
│   ├── launcher/               # 启动器(搜索框 + 结果列表)
│   ├── pages/                  # 页面(Dashboard / Settings / 各插件页)
│   ├── plugins/                # 插件定义
│   │   ├── json-editor/        # JSON 编辑器插件
│   │   └── port-manager/       # 端口管理插件
│   ├── core/
│   │   ├── plugin/             # PluginManager(插件注册中心)
│   │   ├── command/            # CommandManager(命令聚合)
│   │   └── search/             # FuseSearch(模糊搜索)
│   ├── components/             # 通用组件(Layout / Toast / Dialog / ui)
│   ├── stores/                 # Zustand 状态
│   ├── hooks/                  # useTheme / useToast / useGlobalShortcut
│   ├── services/               # Tauri invoke 封装
│   └── types/                  # Plugin / Command 等类型定义
└── src-tauri/                  # Rust 后端
    ├── tauri.conf.json         # 窗口 / 打包配置
    ├── capabilities/           # IPC 权限清单
    └── src/
        ├── lib.rs              # 应用装配:快捷键、窗口事件、失焦隐藏
        ├── commands/           # Tauri 命令(port / shortcut / settings)
        ├── tray/               # 系统托盘
        └── utils/              # 平台工具
```

## 🛠 技术栈

- **前端**:React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · Fuse.js · Monaco Editor · Lucide Icons
- **后端**:Tauri 2(global-shortcut / store / single-instance / tray-icon)· Rust

## 🗺 Roadmap

- [ ] 自动检查更新
- [ ] 开机自启动
- [ ] 插件启用/禁用管理与动态路由(消费 `Plugin.page` 字段)
- [ ] 更多内置插件(时间戳转换、编解码、颜色工具…)

## 📄 License

[MIT](https://opensource.org/licenses/MIT)
