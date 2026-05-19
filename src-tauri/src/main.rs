// Prevents an extra console window when running the release `.exe` on Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod cache;
mod commands;
mod genius;
mod lyric_filter;
mod spotify;

use tauri::{Emitter, Manager};

const WELCOME_CHECK_EVENT: &str = "daily-welcome-check";

fn emit_welcome_check(app: &tauri::AppHandle) {
    let _ = app.emit(WELCOME_CHECK_EVENT, ());
}

fn attach_welcome_triggers(app: &tauri::AppHandle) {
    for (label, window) in app.webview_windows() {
        if label == "welcome" {
            continue;
        }
        let handle = app.clone();
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(true) = event {
                emit_welcome_check(&handle);
            }
        });
    }
}

fn main() {
    let env_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(".env");
    let _ = dotenvy::from_path(&env_path);
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_denylist(&["welcome"])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_current_lyric,
            commands::get_now_playing_track,
            commands::spotify_is_authenticated,
            commands::spotify_login,
        ])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                let menu = tauri::menu::Menu::default(app.handle())?;
                app.set_menu(menu)?;
            }

            #[cfg(all(target_os = "macos", not(debug_assertions)))]
            if let Err(err) = app
                .handle()
                .set_activation_policy(tauri::ActivationPolicy::Accessory)
            {
                eprintln!("[orbit] set_activation_policy: {err}");
            }

            attach_welcome_triggers(app.handle());

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if matches!(event, tauri::RunEvent::Resumed) {
                emit_welcome_check(&app_handle);
            }
        });
}
