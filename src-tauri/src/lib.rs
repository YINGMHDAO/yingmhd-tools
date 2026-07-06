mod commands;
mod tray;
mod utils;

use std::sync::atomic::{AtomicBool, Ordering};

use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use utils::platform;

/// 「失焦自动隐藏」运行时开关，随设置命令实时更新
pub struct HideOnBlur(pub AtomicBool);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                window.show().ok();
                window.set_focus().ok();
            }
        }))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            tray::tray::setup_tray(app)?;

            setup_global_shortcut(app);

            app.manage(HideOnBlur(AtomicBool::new(load_stored_hide_on_blur(app))));

            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    api.prevent_close();
                    window_clone.hide().ok();
                }
                tauri::WindowEvent::Focused(false) => {
                    // debug 构建下打开 devtools 会使主窗口失焦，跳过避免开发时窗口不断消失
                    #[cfg(debug_assertions)]
                    if window_clone.is_devtools_open() {
                        return;
                    }
                    let state = window_clone.app_handle().state::<HideOnBlur>();
                    if state.0.load(Ordering::Relaxed) {
                        window_clone.hide().ok();
                    }
                }
                _ => {}
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::port::get_ports,
            commands::port::kill_process,
            commands::shortcut::get_shortcut,
            commands::shortcut::set_shortcut,
            commands::shortcut::get_default_shortcut,
            commands::settings::get_hide_on_blur,
            commands::settings::set_hide_on_blur,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// 注册全局快捷键并绑定窗口显隐切换（只响应按下事件）
pub fn register_toggle_shortcut(
    app: &tauri::AppHandle,
    shortcut: Shortcut,
) -> Result<(), tauri_plugin_global_shortcut::Error> {
    let window = app.get_webview_window("main").unwrap();
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _shortcut, event| {
            // 回调在按下和松开时各触发一次，只处理按下，避免 toggle 两次抵消
            if event.state() != ShortcutState::Pressed {
                return;
            }
            if window.is_visible().unwrap_or(false) {
                window.hide().ok();
            } else {
                window.show().ok();
                window.set_focus().ok();
                // 短暂置顶确保窗口到最前，延迟复位放到后台线程，避免阻塞事件线程
                window.set_always_on_top(true).ok();
                let w = window.clone();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_millis(200));
                    w.set_always_on_top(false).ok();
                });
            }
        })
}

fn setup_global_shortcut(app: &tauri::App) {
    let shortcut_str = platform::default_shortcut_string();

    #[cfg(any(target_os = "macos", target_os = "windows"))]
    let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::Space);

    let effective_shortcut = load_stored_shortcut(app).unwrap_or(shortcut);

    match register_toggle_shortcut(app.handle(), effective_shortcut) {
        Ok(_) => {
            log::info!("Global shortcut registered: {}", shortcut_str);
        }
        Err(e) => {
            log::warn!("Global shortcut failed: {} - {}", shortcut_str, e);
            app.emit(
                "shortcut-conflict",
                serde_json::json!({
                    "attempted": shortcut_str,
                    "error": e.to_string(),
                }),
            )
            .ok();
        }
    }
}

fn load_stored_hide_on_blur(app: &tauri::App) -> bool {
    use tauri_plugin_store::StoreBuilder;

    StoreBuilder::new(app.handle(), "settings.json")
        .build()
        .ok()
        .and_then(|store| store.get("hide_on_blur"))
        .and_then(|v| v.as_bool())
        .unwrap_or(true)
}

fn load_stored_shortcut(app: &tauri::App) -> Option<Shortcut> {
    use tauri_plugin_store::StoreBuilder;

    let store = StoreBuilder::new(app.handle(), "settings.json")
        .build()
        .ok()?;
    let shortcut_str = store
        .get("shortcut")
        .and_then(|v| v.as_str().map(String::from))?;

    shortcut_str.parse().ok()
}
