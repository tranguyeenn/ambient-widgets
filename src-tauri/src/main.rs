// Binary entry: smallest possible `main` that hands off to the library crate.
//
// Why two files (`main.rs` + `lib.rs`)? Tauri’s mobile targets need a stable `lib` entry point
// (`run()`), while desktop still uses a `main` binary. The `lib` name in Cargo.toml is
// `ambient_widgets_lib` so it doesn’t clash with the binary name on Windows.

// Prevents an extra console window when running the release `.exe` on Windows. Keep as-is.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ambient_widgets_lib::run()
}
