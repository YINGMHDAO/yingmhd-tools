#!/usr/bin/env node
// YINGMHD Tools 启动器:npm 全局安装后通过 `yingmhd-tools` 命令启动桌面应用
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const RELEASES_URL = 'https://github.com/YINGMHDAO/yingmhd-tools/releases';

if (process.platform === 'darwin') {
  const appPath = join(pkgRoot, 'binaries', 'macos', 'yingmhd-tools.app');
  if (!existsSync(appPath)) {
    console.error('未找到应用文件,安装可能不完整,请尝试重新安装: npm install -g yingmhd-tools');
    process.exit(1);
  }
  const result = spawnSync('open', [appPath], { stdio: 'inherit' });
  process.exit(result.status ?? 0);
} else if (process.platform === 'win32') {
  const exePath = join(pkgRoot, 'binaries', 'windows', 'yingmhd-tools.exe');
  if (existsSync(exePath)) {
    const result = spawnSync(exePath, [], { stdio: 'ignore', detached: true });
    process.exit(result.status ?? 0);
  }
  console.error(`Windows 版暂未随 npm 包分发,请从源码构建或关注 GitHub Releases: ${RELEASES_URL}`);
  process.exit(1);
} else {
  console.error(`当前平台 (${process.platform}) 暂不支持,详见: ${RELEASES_URL}`);
  process.exit(1);
}
