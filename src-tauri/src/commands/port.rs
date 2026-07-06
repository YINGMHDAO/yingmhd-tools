use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PortInfo {
    pub port: u16,
    pub pid: u32,
    pub process_name: String,
}

/// 扫描系统端口，返回端口列表
#[tauri::command]
pub async fn get_ports() -> Result<Vec<PortInfo>, String> {
    #[cfg(target_os = "macos")]
    {
        get_ports_macos()
    }
    #[cfg(target_os = "windows")]
    {
        get_ports_windows()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("不支持的操作系统".to_string())
    }
}

/// 结束指定 PID 的进程
#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("kill")
            .arg("-9")
            .arg(pid.to_string())
            .output()
            .map_err(|e| format!("执行 kill 命令失败: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("结束进程失败: {}", stderr))
        }
    }
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("taskkill")
            .arg("/PID")
            .arg(pid.to_string())
            .arg("/F")
            .output()
            .map_err(|e| format!("执行 taskkill 命令失败: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("结束进程失败: {}", stderr))
        }
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("不支持的操作系统".to_string())
    }
}

/// macOS: 使用 lsof 获取端口列表
#[cfg(target_os = "macos")]
fn get_ports_macos() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("lsof")
        .args(["-iTCP", "-sTCP:LISTEN", "-nP"])
        .output()
        .map_err(|e| format!("执行 lsof 命令失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("lsof 命令执行失败: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut ports: Vec<PortInfo> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for line in stdout.lines().skip(1) {
        // lsof 输出格式: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 9 {
            continue;
        }

        let process_name = parts[0].to_string();
        let pid: u32 = parts[1].parse().unwrap_or(0);
        if pid == 0 {
            continue;
        }

        // NAME 字段包含端口信息，格式类似: *:3000 或 0.0.0.0:3000
        let name_field = parts[8];
        if let Some(port_str) = name_field.rsplit(':').next() {
            if let Ok(port) = port_str.parse::<u16>() {
                // 去重（同一个端口可能被 IPv4 和 IPv6 各报告一次）
                if seen.insert((port, pid)) {
                    ports.push(PortInfo {
                        port,
                        pid,
                        process_name,
                    });
                }
            }
        }
    }

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

/// Windows: 使用 netstat 获取端口列表
#[cfg(target_os = "windows")]
fn get_ports_windows() -> Result<Vec<PortInfo>, String> {
    let output = Command::new("netstat")
        .args(["-ano"])
        .output()
        .map_err(|e| format!("执行 netstat 命令失败: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut ports: Vec<PortInfo> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for line in stdout.lines().skip(4) {
        if !line.contains("LISTENING") {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 5 {
            continue;
        }

        // 本地地址格式: 0.0.0.0:3000 或 [::]:3000
        let local_addr = parts[1];
        let port: u16 = if let Some(port_str) = local_addr.rsplit(':').next() {
            port_str.parse().unwrap_or(0)
        } else {
            continue;
        };
        if port == 0 {
            continue;
        }

        let pid: u32 = parts[4].parse().unwrap_or(0);
        if pid == 0 {
            continue;
        }

        // 通过 sysinfo 获取进程名
        let process_name = get_process_name_windows(pid);

        if seen.insert((port, pid)) {
            ports.push(PortInfo {
                port,
                pid,
                process_name,
            });
        }
    }

    ports.sort_by_key(|p| p.port);
    Ok(ports)
}

/// Windows: 通过 PID 获取进程名
#[cfg(target_os = "windows")]
fn get_process_name_windows(pid: u32) -> String {
    use std::process::Command;
    let output = Command::new("tasklist")
        .args(["/FI", &format!("PID eq {}", pid), "/FO", "CSV", "/NH"])
        .output();

    if let Ok(output) = output {
        let stdout = String::from_utf8_lossy(&output.stdout);
        if let Some(line) = stdout.lines().next() {
            let parts: Vec<&str> = line.split(',').collect();
            if !parts.is_empty() {
                return parts[0].trim_matches('"').to_string();
            }
        }
    }

    format!("PID:{}", pid)
}
