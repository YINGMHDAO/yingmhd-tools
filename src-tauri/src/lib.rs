mod commands;
mod tray;
mod utils;

use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
use utils::platform;

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

            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    window_clone.hide().ok();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::port::get_ports,
            commands::port::kill_process,
            commands::shortcut::get_shortcut,
            commands::shortcut::set_shortcut,
            commands::shortcut::get_default_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_global_shortcut(app: &tauri::App) {
    let window = app.get_webview_window("main").unwrap();
    let shortcut_str = platform::default_shortcut_string();

    #[cfg(target_os = "macos")]
    let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
    #[cfg(target_os = "windows")]
    let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::Space);

    let effective_shortcut = load_stored_shortcut(app).unwrap_or(shortcut);

    match app.global_shortcut().on_shortcut(effective_shortcut.clone(), {
        let window = window.clone();
        move |_app, _shortcut, _event| {
            if window.is_visible().unwrap_or(false) {
                window.hide().ok();
            } else {
                window.show().ok();
                window.set_focus().ok();
                window.set_always_on_top(true).ok();
                std::thread::sleep(std::time::Duration::from_millis(200));
                window.set_always_on_top(false).ok();
            }
        }
    }) {
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
