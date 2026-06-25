# YINGMHD Tools - MVP v0.1 实现计划

## Context

构建一个面向开发者的跨平台桌面启动器（Developer Launcher），类似 Raycast/Alfred/uTools，但更偏向开发者场景。按下全局快捷键 → 弹出 Command Palette → 搜索/执行插件命令。MVP 阶段内置 JSON 编辑器 和 端口管理 两个插件，建立完整的插件架构。目标：安装包 <20MB、启动 <2s、常驻内存 <100MB。

**默认快捷键**：macOS `Option+Space` / Windows `Alt+Space`。**必须有冲突兜底**：快捷键注册失败时弹窗引导用户自定义；系统层面保留 macOS 菜单栏图标和 Windows 任务栏图标作为常驻入口。

---

## 一、项目初始化

### 1.1 创建项目

```bash
npm create vite@latest yingmhd-tools -- --template react-ts
cd yingmhd-tools
npm install
npm install -D @tauri-apps/cli@latest
npx tauri init
```

配置项：
- App name: `yingmhd-tools`
- Window title: `YINGMHD Tools`
- Dev URL: `http://localhost:5173`
- Dist dir: `../dist`
- Before dev/build: `npm run build`

### 1.2 前端依赖

```bash
# 核心
npm install @tauri-apps/api@latest
npm install @tauri-apps/plugin-store @tauri-apps/plugin-global-shortcut
npm install @tauri-apps/plugin-single-instance
npm install react-router-dom zustand @monaco-editor/react
npm install lucide-react fuse.js clsx tailwind-merge

# 开发
npm install -D tailwindcss @tailwindcss/vite
npm install -D prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 1.3 Rust 依赖 (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
tauri-plugin-store = "2"
tauri-plugin-global-shortcut = "2"
tauri-plugin-single-instance = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sysinfo = "0.31"       # 跨平台系统信息（替代 lsof/netstat 的进程部分）
```

> **端口扫描实现说明**：`sysinfo` 提供跨平台进程信息（PID、进程名等）。端口到 PID 的映射仍需要平台特定方案：macOS 解析 `lsof -iTCP -sTCP:LISTEN -nP`，Windows 使用 `netstat -ano`，封装在不同平台分支中。纯 Rust 方案（如直接读取 `/proc` 或调用系统 API）可作为后续优化。

---

## 二、项目目录结构

```
yingmhd-tools/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   │   ├── icon.png
│   │   ├── icon.ico
│   │   └── tray-icon.png
│   └── src/
│       ├── main.rs
│       ├── lib.rs               # 插件注册 + 快捷键 + 单实例 + 托盘 + 窗口行为
│       ├── commands/
│       │   ├── mod.rs
│       │   ├── port.rs          # get_ports, kill_process
│       │   └── shortcut.rs      # set_shortcut, get_shortcut, get_default_shortcut
│       ├── tray/
│       │   ├── mod.rs
│       │   └── tray.rs          # 系统托盘菜单
│       └── utils/
│           ├── mod.rs
│           └── platform.rs      # 平台检测 + 系统命令封装
│
├── src/
│   ├── main.tsx                 # React 入口，注册插件
│   ├── App.tsx                  # ThemeProvider + Router
│   ├── index.css                # TailwindCSS + CSS变量 + 全局样式
│   │
│   ├── types/
│   │   └── index.ts             # Plugin, Command, PortInfo, Toast 等
│   │
│   ├── core/
│   │   ├── plugin/
│   │   │   ├── PluginManager.ts  # 插件管理器（单例）
│   │   │   └── index.ts
│   │   ├── command/
│   │   │   ├── CommandManager.ts # 命令管理器（单例）
│   │   │   └── index.ts
│   │   └── search/
│   │       ├── FuseSearch.ts     # Fuse.js 模糊搜索封装
│   │       └── index.ts
│   │
│   ├── launcher/
│   │   ├── Launcher.tsx          # Command Palette 主组件
│   │   ├── LauncherInput.tsx     # 搜索输入框
│   │   └── LauncherResults.tsx   # 搜索结果列表
│   │
│   ├── plugin/
│   │   └── index.ts             # 导出 Plugin + Command 类型
│   │
│   ├── plugins/
│   │   ├── json-editor/
│   │   │   ├── index.ts         # 插件注册入口
│   │   │   ├── JsonEditorPage.tsx
│   │   │   └── commands.ts      # 格式化/压缩/校验 命令
│   │   └── port-manager/
│   │       ├── index.ts         # 插件注册入口
│   │       ├── PortManagerPage.tsx
│   │       └── commands.ts      # 扫描端口/Kill进程 命令
│   │
│   ├── stores/
│   │   ├── appStore.ts          # 主题、窗口状态（持久化）
│   │   ├── pluginStore.ts       # 插件列表、启用状态
│   │   ├── commandStore.ts      # 搜索结果、当前输入
│   │   ├── portStore.ts         # 端口列表、搜索关键词
│   │   └── jsonStore.ts         # JSON 输入/输出/错误
│   │
│   ├── services/
│   │   └── portService.ts       # 封装 Tauri invoke
│   │
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useToast.ts
│   │   └── useGlobalShortcut.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx        # 版本/系统信息/插件管理
│   │   └── Settings.tsx         # 主题/更新/开机启动
│   │
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Toast.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── ShortcutConflictDialog.tsx  # 快捷键冲突弹窗（首次启动）
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── switch.tsx
│   │       └── utils.ts
│   │
│   └── utils/
│       └── cn.ts
```

---

## 三、核心架构设计

### 3.1 数据流

```
Global Shortcut (Option+Space / Alt+Space)
       │
       ▼
  窗口显示/隐藏 + 自动聚焦 + 置顶
       │
       ▼
  Command Palette (Launcher)
       │
       ├── 用户输入 → FuseSearch 模糊搜索 ──→ 匹配的命令列表
       │
       ▼
  PluginManager.getCommands() → 按匹配度排序展示
       │
       ▼
  用户选择/回车 → Command.run() 或 导航到 Plugin.page
```

### 3.2 Plugin 接口 (`src/types/index.ts`)

```ts
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;           // Lucide 图标名
  version: string;
  enabled: boolean;
  keywords: string[];     // 搜索关键词
  page?: React.ComponentType;  // 完整页面（可选）
  commands?: Command[];        // 命令列表（可选）
  aiEnabled?: boolean;         // 预留 AI 扩展
}

export interface Command {
  id: string;
  title: string;
  keywords: string[];
  run(input?: string): Promise<void> | void;
}
```

### 3.3 PluginManager (`src/core/plugin/PluginManager.ts`)

```ts
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin): void;
  unregister(id: string): void;
  getPlugin(id: string): Plugin | undefined;
  getPlugins(): Plugin[];
  getEnabledPlugins(): Plugin[];
  getCommands(): Command[];   // 聚合所有已启用插件的 commands
  togglePlugin(id: string): void;
}

export const pluginManager = new PluginManager();
```

### 3.4 CommandManager (`src/core/command/CommandManager.ts`)

```ts
class CommandManager {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void;
  unregister(id: string): void;
  getAll(): Command[];
  execute(id: string, input?: string): Promise<void>;
}

export const commandManager = new CommandManager();
```

### 3.5 FuseSearch (`src/core/search/FuseSearch.ts`)

```ts
import Fuse from 'fuse.js';

class FuseSearch {
  private fuse: Fuse<SearchItem>;
  
  constructor(items: SearchItem[]);
  search(query: string): SearchResult[];
  updateItems(items: SearchItem[]): void;  // 插件注册/注销时更新索引
}

interface SearchItem {
  id: string;
  title: string;
  keywords: string[];
  type: 'command' | 'plugin';
}
```

搜索特性：
- 模糊搜索（`json` → `JSON Editor`）
- 拼写容错（`josn` → `JSON Editor`）
- 关键词权重（精确匹配 > 前缀匹配 > 模糊匹配）

### 3.6 Command Palette 组件 (`src/launcher/Launcher.tsx`)

```
┌──────────────────────────────────┐
│  🔍  > josn                      │  ← LauncherInput（自动聚焦）
├──────────────────────────────────┤
│  { } JSON Editor                 │  ← LauncherResults
│  🔌 Port Manager                 │     匹配插件名/命令/关键词
│  📋 Format JSON                  │
│  🗜  Compress JSON               │
│  ✅  Validate JSON               │
│  🔍  Scan Ports                  │
└──────────────────────────────────┘
```

交互：
- **回车**：执行选中命令或打开插件页面
- **上下箭头**：选择结果项
- **ESC**：隐藏窗口
- **失焦**：自动隐藏（可选）

窗口行为：
- 显示时自动聚焦输入框
- 窗口置顶（`alwaysOnTop: true`）
- 居中显示，宽度约 600px

---

## 四、内置插件设计

### 4.1 JSON Editor 插件

```ts
// src/plugins/json-editor/index.ts
export const jsonEditorPlugin: Plugin = {
  id: 'json-editor',
  name: 'JSON Editor',
  description: '格式化、压缩、校验 JSON 数据',
  icon: 'Braces',
  version: '1.0.0',
  enabled: true,
  keywords: ['json', 'formatter', 'format', 'compress', 'validate', 'beautify'],
  page: JsonEditorPage,
  commands: [
    {
      id: 'json-format',
      title: '格式化 JSON',
      keywords: ['format', 'beautify', 'pretty'],
      run: () => { /* 打开 JSON Editor 并执行格式化 */ }
    },
    // ... compress, validate 命令同理
  ],
};
```

### 4.2 Port Manager 插件

```ts
// src/plugins/port-manager/index.ts
export const portManagerPlugin: Plugin = {
  id: 'port-manager',
  name: 'Port Manager',
  description: '查看和管理系统端口占用',
  icon: 'Network',
  version: '1.0.0',
  enabled: true,
  keywords: ['port', 'network', 'kill', 'pid', 'listen'],
  page: PortManagerPage,
  commands: [
    {
      id: 'port-scan',
      title: '扫描端口',
      keywords: ['scan', 'list', 'ports'],
      run: () => { /* 打开 Port Manager 并刷新 */ }
    },
  ],
};
```

---

## 五、Tauri 后端设计

### 5.1 全局快捷键 (`lib.rs`)

```rust
// macOS: Option + Space
// Windows: Alt + Space
#[cfg(target_os = "macos")]
fn default_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::ALT), Code::Space)
}
#[cfg(target_os = "windows")]
fn default_shortcut() -> Shortcut {
    Shortcut::new(Some(Modifiers::ALT), Code::Space)
}
```

#### 快捷键冲突兜底机制

```
应用启动
    │
    ├── 从 Tauri Store 读取用户自定义快捷键（如有）
    │
    ├── 尝试注册快捷键
    │       │
    │       ├── 注册成功 ──→ 正常使用
    │       │
    │       └── 注册失败（冲突）
    │               │
    │               ├── 弹窗提示: "快捷键 Option+Space 已被占用，
    │               │   请设置其他快捷键"
    │               │
    │               ├── 用户可选择:
    │               │   ├── "自定义快捷键" → 打开快捷键录制界面
    │               │   └── "稍后设置" → 关闭弹窗，通过托盘图标使用
    │               │
    │               └── 快捷键持久化到 Tauri Store
    │
    └── 任何时候用户可通过托盘图标 → "显示窗口" 打开应用
        进入 设置 → 快捷键 → 修改快捷键
```

**Rust 端冲突检测实现**：

```rust
// lib.rs setup() 中
fn setup_shortcut(app: &mut App) -> Result<(), String> {
    let stored_shortcut = load_shortcut_from_store(app);  // 从 Store 读取
    let shortcut_str = stored_shortcut.unwrap_or_else(default_shortcut_string);
    let shortcut: Shortcut = shortcut_str.parse()?;
    
    match app.global_shortcut().register(shortcut) {
        Ok(_) => {
            // 注册成功，绑定事件
            app.global_shortcut().on_shortcut(shortcut, toggle_window);
            Ok(())
        }
        Err(e) => {
            // 注册失败，通知前端
            app.emit("shortcut-conflict", ShortcutConflictEvent {
                attempted: shortcut_str,
                error: e.to_string(),
            });
            Err(e.to_string())
        }
    }
}
```

**前端冲突处理**：

```ts
// 监听 shortcut-conflict 事件
listen('shortcut-conflict', (event) => {
  showShortcutConflictDialog(event.payload);
});
```

**快捷键自定义实现**（设置页或冲突弹窗中）：
- 用户点击 "录制快捷键" 按钮
- 监听 `keydown` 事件捕获组合键（修饰键 + 普通键）
- 格式化后发送到 Rust 后端尝试注册
- 注册成功 → 保存到 Tauri Store
- 注册失败 → 提示继续冲突，重新选择

### 5.2 单实例 (`lib.rs`)

```rust
.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
    // 已有实例运行时，显示已有窗口
    if let Some(window) = app.get_webview_window("main") {
        window.show().ok();
        window.set_focus().ok();
    }
}))
```

### 5.3 窗口行为

- **关闭按钮** → 隐藏窗口（不退出）
- **全局快捷键** → 切换显示/隐藏
- **ESC** → 隐藏窗口
- **显示时** → `set_focus()` + 置顶
- **托盘图标** → 右键菜单（显示窗口 / 设置 / 退出程序）
- **退出** → 仅通过托盘菜单 "退出程序"

### 5.4 Rust 命令

```rust
// 端口相关
#[tauri::command]
async fn get_ports() -> Result<Vec<PortInfo>, String>;

#[tauri::command]
async fn kill_process(pid: u32) -> Result<(), String>;

// 快捷键相关
#[tauri::command]
async fn set_shortcut(shortcut_str: String) -> Result<(), String>;
// 尝试注册新快捷键，失败返回错误信息。成功则更新并持久化。

#[tauri::command]
async fn get_shortcut() -> Result<String, String>;
// 返回当前快捷键字符串

#[tauri::command]
async fn get_default_shortcut() -> String;
// 返回平台默认快捷键（Option+Space / Alt+Space）
```

**端口扫描方案**：
- 进程信息：`sysinfo` crate（跨平台 PID/进程名）
- 端口→PID 映射：平台特定实现
  - macOS: 解析 `lsof -iTCP -sTCP:LISTEN -nP` 输出
  - Windows: 解析 `netstat -ano` 输出
  - 后续可优化为纯 Rust 实现

### 5.5 系统托盘（常驻入口 + 快捷键兜底）

**核心原则**：无论快捷键是否可用，用户始终能通过系统托盘访问应用。这是快捷键冲突时的兜底入口。

- **macOS**: 菜单栏右侧图标（系统托盘区）
- **Windows**: 任务栏通知区域图标

托盘图标 32x32 PNG，右键菜单：

```
┌─────────────────┐
│ 📋 显示窗口     │  ← 当快捷键不可用时，这是主要入口
│ ⚙  设置         │
│ ─────────────── │
│ 🚪 退出程序     │  ← 唯一的退出途径
└─────────────────┘
```

**菜单栏/任务栏交互**：
- **左键单击**: 显示/隐藏窗口（等同于快捷键行为）
- **右键单击**: 弹出以上菜单
- 应用关闭按钮 → 隐藏到托盘（不退出）
- 应用仅通过 "退出程序" 菜单项退出

**快捷键状态指示**（可选实现）：
- 托盘图标 tooltip 显示当前快捷键绑定
- 快捷键不可用时，tooltip 提示 "快捷键已禁用 - 点击打开"
- 首次启动冲突时，托盘图标旁可显示气泡通知

---

## 六、路由设计 (HashRouter)

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Launcher | **首页** - Command Palette |
| `/json-editor` | JsonEditorPage | JSON 编辑器（插件页面） |
| `/port-manager` | PortManagerPage | 端口管理（插件页面） |
| `/settings` | Settings | 设置页 |
| `/dashboard` | Dashboard | 版本/系统/插件管理 |

> 注意：Launcher 页面没有传统 Sidebar，是一个独立的 Command Palette 弹窗式页面。插件页面（如 `/json-editor`）有标准的应用布局。

---

## 七、状态管理 (Zustand)

| Store | 数据 | 持久化 |
|-------|------|--------|
| **appStore** | 主题、窗口状态 | ✅ Tauri Store |
| **pluginStore** | 插件列表、启用状态 | ✅ Tauri Store |
| **commandStore** | 搜索输入、搜索结果 | ❌ |
| **portStore** | 端口列表、搜索词 | ❌ |
| **jsonStore** | 输入/输出内容、错误 | ❌ |

### appStore 持久化键

```ts
interface AppState {
  theme: 'dark' | 'light';
  shortcut: string;                    // 当前快捷键字符串，如 "Option+Space"
  shortcutEnabled: boolean;            // 快捷键是否启用
  shortcutConflict: boolean;           // 是否存在冲突
  launcherWidth: number;               // Launcher 窗口宽度
}
// 存储键: "app-state"
```

### pluginStore 持久化键

```ts
interface PluginState {
  plugins: Array<{ id: string; enabled: boolean }>;
}
// 存储键: "plugin-state"
```

---

## 八、主题系统

VSCode 风格深色主题（默认），支持切换到浅色。

```css
:root[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d30;
  --text-primary: #cccccc;
  --text-secondary: #858585;
  --border-color: #3e3e42;
  --accent: #007acc;
  --danger: #f44747;
  --success: #4ec9b0;
  --launcher-bg: rgba(30, 30, 30, 0.95);  /* Launcher 半透明背景 */
}

:root[data-theme="light"] {
  /* 对应浅色值 */
}
```

Monaco Editor 通过 `defineTheme` 同步切换。

---

## 九、Toast 系统

```ts
type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }
```

通过 appStore 管理 Toast 队列，自动 3 秒消失，Layout 组件渲染。

---

## 十、布局设计（插件页面）

Launcher 页面是独立的全屏居中弹窗式布局。插件页面（JSON Editor、Port Manager）使用标准应用布局：

```
┌─────────────────────────────────────┐
│ ← 返回  插件名称            ⚙ ⚡    │  ← 顶部导航栏（非 Sidebar）
├─────────────────────────────────────┤
│                                     │
│         插件页面内容                  │
│                                     │
└─────────────────────────────────────┘
```

> 注意：v0.1 暂时去掉传统 Sidebar 布局。插件页面顶部有一个简洁的导航栏（返回按钮 + 插件名称 + 设置入口）。后续版本可考虑恢复 Sidebar 作为可选项。

---

## 十一、实施步骤

### Phase 1: 项目脚手架
- 创建 Vite + React + TS 项目
- 初始化 Tauri v2
- 安装全部依赖
- TailwindCSS v4 + CSS 变量
- ESLint + Prettier 配置
- TypeScript strict 模式
- `tauri.conf.json` 基础配置

### Phase 2: 核心模块
- `PluginManager.ts` - 插件注册/注销/查询
- `CommandManager.ts` - 命令注册/执行
- `FuseSearch.ts` - 模糊搜索封装
- 类型定义（Plugin, Command, PortInfo, Toast 等）

### Phase 3: Launcher + 窗口控制
- `Launcher.tsx` - Command Palette UI
- Tauri 后端：全局快捷键注册
- Tauri 后端：单实例检测
- Tauri 后端：系统托盘
- Tauri 后端：窗口显示/隐藏/置顶/ESC 行为
- `useGlobalShortcut.ts` - 前端快捷键事件

### Phase 4: JSON Editor 插件
- 插件注册（index.ts + commands.ts）
- `JsonEditorPage.tsx` - Monaco Editor 左右分栏
- 工具栏：格式化/压缩/校验/复制/清空
- 主题同步
- Toast 集成

### Phase 5: Port Manager 插件
- 插件注册（index.ts + commands.ts）
- Rust 命令：`get_ports`, `kill_process`
- `PortManagerPage.tsx` - 端口列表 + 搜索 + Kill
- 确认弹窗
- Toast 集成

### Phase 6: 设置 & 收尾
- `Dashboard.tsx` - 版本/系统信息/插件管理
- `Settings.tsx`:
  - **主题切换** - Dark/Light Switch
  - **快捷键设置** - 显示当前快捷键，点击 "修改快捷键" 进入录制模式
    - 录制模式：按键捕获（修饰键+普通键），格式化显示
    - 保存时调用 `set_shortcut` Tauri 命令
    - 注册成功 → Toast 提示 "快捷键已更新为 XXX"
    - 注册失败 → Toast 提示 "快捷键冲突，请尝试其他组合"
    - "恢复默认" 按钮
  - **快捷键状态指示** - 显示是否启用/冲突
  - 自动检查更新 Switch（UI 占位，disabled）
  - 开机启动 Switch（UI 占位，disabled）
- **首次启动快捷键冲突弹窗** (`ShortcutConflictDialog.tsx`)
  - 应用首次启动且快捷键注册失败时弹出
  - 提示内容："快捷键 Option+Space 注册失败（可能被其他应用占用）"
  - 两个按钮：[自定义快捷键] [稍后设置（通过托盘图标打开）]
- 主题持久化 + 切换
- 全流程验证

---

## 十二、验证方案

1. **全局快捷键**: 按下 `Option+Space`(macOS) / `Alt+Space`(Windows) → 窗口弹出，Command Palette 自动聚焦
2. **模糊搜索**: 输入 `josn` → 匹配 JSON Editor 相关命令
3. **命令执行**: 选择 "格式化 JSON" → 打开 JSON Editor 页面
4. **插件页面**: JSON Editor 格式化/压缩/校验/复制/清空 全流程
5. **端口管理**: 扫描端口 → 搜索过滤 → Kill 进程 → 确认弹窗
6. **窗口行为**: ESC 隐藏 / 关闭按钮隐藏到托盘 / 快捷键切换显示
7. **单实例**: 尝试启动第二个实例 → 已有窗口显示
8. **主题切换**: Dark/Light 切换，Monaco Editor 同步
9. **持久化**: 重启后主题和插件状态保持
10. **托盘**: 右键菜单（显示/设置/退出）正常工作

---

## 十三、注意事项

- Monaco Editor CSP: `worker-src 'self' blob: data:`
- shadcn/ui 手动复制 5 个组件，不走 CLI
- 所有 Rust 命令返回 `Result<T, String>`，前端统一 Toast 错误
- 每个文件 <300 行
- TypeScript strict，禁用 `any`
- `tauri-plugin-single-instance` 需要确认与 Tauri v2 的兼容版本
- 端口扫描当前使用系统命令解析（lsof/netstat），后续可优化为纯 Rust 实现
- Windows 上 `Alt+Space` 可能被系统菜单占用，此为已知风险。冲突发生时自动触发兜底弹窗引导用户自定义快捷键，不影响应用使用（托盘入口始终可用）
