use std::sync::atomic::Ordering;

use tauri::Manager;

use crate::HideOnBlur;

/// 获取「失焦自动隐藏」开关状态（缺省开启）
#[tauri::command]
pub async fn get_hide_on_blur(app: tauri::AppHandle) -> Result<bool, String> {
    let store = tauri_plugin_store::StoreBuilder::new(&app, "settings.json")
        .build()
        .map_err(|e| format!("无法打开存储: {}", e))?;

    Ok(store
        .get("hide_on_blur")
        .and_then(|v| v.as_bool())
        .unwrap_or(true))
}

/// 设置「失焦自动隐藏」开关状态
#[tauri::command]
pub async fn set_hide_on_blur(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    app.state::<HideOnBlur>().0.store(enabled, Ordering::Relaxed);

    let store = tauri_plugin_store::StoreBuilder::new(&app, "settings.json")
        .build()
        .map_err(|e| format!("无法打开存储: {}", e))?;

    store.set("hide_on_blur", serde_json::Value::Bool(enabled));

    store.save().map_err(|e| format!("保存失败: {}", e))?;

    Ok(())
}
