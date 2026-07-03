use crate::utils::platform;

/// 获取当前存储的快捷键
#[tauri::command]
pub async fn get_shortcut(app: tauri::AppHandle) -> Result<String, String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "settings.json")
        .build()
        .map_err(|e| format!("无法打开存储: {}", e))?;

    let shortcut = store
        .get("shortcut")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(platform::default_shortcut_string);

    Ok(shortcut)
}

/// 获取平台默认快捷键
#[tauri::command]
pub async fn get_default_shortcut() -> String {
    platform::default_shortcut_string()
}

/// 设置新快捷键
#[tauri::command]
pub async fn set_shortcut(
    app: tauri::AppHandle,
    shortcut_str: String,
) -> Result<(), String> {
    use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

    let shortcut: Shortcut = shortcut_str
        .parse()
        .map_err(|e| format!("快捷键格式无效: {}", e))?;

    // 记录旧快捷键，注册失败时回滚
    let old_shortcut: Option<Shortcut> = get_shortcut(app.clone())
        .await
        .ok()
        .and_then(|s| s.parse().ok());

    // 本应用只注册一个全局快捷键，先全部注销避免旧键泄漏
    app.global_shortcut()
        .unregister_all()
        .map_err(|e| format!("注销旧快捷键失败: {}", e))?;

    // 用统一的 handler 注册新快捷键
    if let Err(e) = crate::register_toggle_shortcut(&app, shortcut) {
        if let Some(old) = old_shortcut {
            crate::register_toggle_shortcut(&app, old).ok();
        }
        return Err(format!("快捷键注册失败（可能被占用）: {}", e));
    }

    let store = tauri_plugin_store::StoreBuilder::new(&app, "settings.json")
        .build()
        .map_err(|e| format!("无法打开存储: {}", e))?;

    store.set("shortcut", serde_json::Value::String(shortcut_str));

    store.save().map_err(|e| format!("保存失败: {}", e))?;

    Ok(())
}
