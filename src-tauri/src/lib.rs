// Rust side of the Tauri app: native window, menus, filesystem, etc.
// Commands overview: https://tauri.app/develop/calling-rust/
//
// `#[tauri::command]` exposes a function to the frontend via `invoke('greet', { name: '...' })`.
// Commands must be registered in `invoke_handler!` below or they are not callable from JS.
//
// `tauri::generate_context!()` embeds config from `tauri.conf.json` at compile time.
// `tauri_plugin_opener` is the starter “open URL in default browser” plugin from the template.

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// On iOS/Android, the app may use this as the shared library entry; on desktop it’s unused at link time.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
