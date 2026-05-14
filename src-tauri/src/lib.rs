//! Ambient Widgets — native shell (Tauri 2).
//!
//! ## Multi-window model
//! Each desktop widget runs in its **own** [`WebviewWindow`](https://docs.rs/tauri/2/tauri/webview/struct.WebviewWindow.html)
//! with a dedicated HTML entry from the Vite multi-page build (`pages/lyrics.html`, `pages/calendar.html`, …).
//! Windows are declared in `tauri.conf.json` under `app.windows` (labels `lyric`, `calendar`, …).
//! That keeps React trees, CSS stacking, and drag targets isolated per widget.
//!
//! ## Adding another widget
//! 1. Add `widgets/<name>/…` in the frontend and a new `<name>.html` + `src/<name>.tsx` entry.
//! 2. Register the page in `vite.config.ts` → `build.rollupOptions.input`.
//! 3. Append a window block in `tauri.conf.json` with a unique `label` and matching `url` (e.g. `pages/<name>.html`).
//! 4. Add the same `label` to `capabilities/default.json` → `windows` so permissions apply.

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Standard macOS app menu so ⌘Q (“Quit …”) is wired to terminate the process.
            // Without an app menu containing Quit, Command+Q does nothing (common with bare Tauri shells).
            #[cfg(target_os = "macos")]
            {
                let menu = tauri::menu::Menu::default(app.handle())?;
                app.set_menu(menu)?;
            }

            // Desktop widget feel in release: no Dock icon, no Cmd+Tab tile (macOS “accessory” app).
            // In debug (`tauri dev`) we keep the default policy so the app stays easy to find.
            #[cfg(all(target_os = "macos", not(debug_assertions)))]
            if let Err(err) = app
                .handle()
                .set_activation_policy(tauri::ActivationPolicy::Accessory)
            {
                eprintln!("[ambient-widgets] set_activation_policy: {err}");
            }

            // Calendar = “desk layer”: stay below normal app windows (macOS NSWindow level below
            // normal). Re-apply here so ordering wins after the webview is fully created.
            if let Some(cal) = app.get_webview_window("calendar") {
                cal.set_always_on_top(false)?;
                cal.set_always_on_bottom(true)?;
                #[cfg(target_os = "macos")]
                cal.set_visible_on_all_workspaces(true)?;
            } else {
                eprintln!("[ambient-widgets] warning: calendar webview missing");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
