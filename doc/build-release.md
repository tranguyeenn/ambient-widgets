# Release build

**Command:** `npm run tauri build`

Produces a signed-ready macOS `.app` and `.dmg` for local install.

## Flow

```text
npm run tauri build
    │
    ├─1─► beforeBuildCommand: npm run build  → dist/
    │
    ├─2─► cargo build --release
    │         ├── build.rs (Tauri codegen)
    │         └── Optimized binary → app bundle
    │
    └─3─► Bundle (tauri.conf.json → bundle)
              ├── targets: "all"
              ├── Icons: src-tauri/icons/
              └── macOS:
                      Orbit.app
                      Orbit_0.1.0_aarch64.dmg
```

## Output paths

| Artifact | Path |
|----------|------|
| App bundle | `src-tauri/target/release/bundle/macos/Orbit.app` |
| Disk image | `src-tauri/target/release/bundle/dmg/Orbit_0.1.0_aarch64.dmg` |

These paths are gitignored — see [build-outputs.md](./build-outputs.md).

## Install on your Mac

```bash
# Open DMG in Finder
npm run open:dmg

# Or copy to Applications
npm run install:mac
```

Then launch **Orbit** from Applications or Spotlight.

## Release-only macOS behavior

In `src-tauri/src/main.rs`, release builds set:

- `ActivationPolicy::Accessory` — no Dock icon, not in ⌘⇥

`tauri dev` keeps the normal policy so the app is easy to find while developing.

## Login at boot

**System Settings → General → Login Items → Open at Login** — add Orbit.

## Related docs

- [build-frontend.md](./build-frontend.md)
- [icons.md](./icons.md)
- [runtime-startup.md](./runtime-startup.md)
