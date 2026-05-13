// Cargo “build script”: runs *before* compiling your crate (`cargo build` / `tauri build`).
// `tauri_build::build()` reads `tauri.conf.json`, generates icons/capability glue, and wires
// assets into the Rust build. If you change Tauri permissions or icons, this script’s
// output is what makes those changes visible to the compiler.

fn main() {
    tauri_build::build()
}
