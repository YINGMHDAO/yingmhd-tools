/// 获取平台默认快捷键字符串
pub fn default_shortcut_string() -> String {
    if cfg!(target_os = "macos") {
        "Option+Space".to_string()
    } else {
        "Alt+Space".to_string()
    }
}

/// 获取平台名称
pub fn platform_name() -> String {
    if cfg!(target_os = "macos") {
        "macOS".to_string()
    } else if cfg!(target_os = "windows") {
        "Windows".to_string()
    } else {
        "Linux".to_string()
    }
}
