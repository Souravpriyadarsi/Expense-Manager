# Expense Manager

A lightweight desktop expense, investment, and income tracker. Local-first —
all data lives on the machine it's used on (`localStorage` inside the app's
WebView); nothing is sent anywhere, no account, no server.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · Zustand · Recharts · React Router (hash)
· Tauri 2 (Windows desktop shell)

## Pages

| Page | What it does |
| --- | --- |
| **Dashboard** | Month-by-month key metrics (income, expenses, investments, net), spending-by-category donut, 6-month trend, biggest expenses, recent activity. |
| **Add Entry** | One form for expenses / investments / income with category, date, account, and notes. Stays open for rapid entry; shows recently added. |
| **Reports** | Date-range scoped. Tabs: expenses by category (expandable bars), investments (allocation donut + list), biggest expenses, and a searchable all-transactions list with edit / delete. |
| **Settings** | Currency symbol, `.json` backup export / import (native file picker where supported, download fallback), optional sample data, delete all data. |

Starts empty — add your own entries, or load sample data from Settings to explore.

## Develop

```bash
npm install
npm run dev        # http://localhost:5174
```

## Build the Windows app (installer to share)

```bash
npm run app:build
```

Output: `src-tauri/target/release/bundle/nsis/Expense Manager_<version>_x64-setup.exe`

That single `.exe` is the whole thing — send it to anyone on Windows 10/11. It's a
per-user install (no admin prompt), adds a Start Menu entry, and can be removed
from *Add or remove programs*. It uses the system WebView2 runtime, which ships
with Windows 11 (and installs automatically on Windows 10 if missing).

The build is **unsigned**, so the first launch shows SmartScreen's
"Windows protected your PC" — click **More info → Run anyway**. A code-signing
certificate (~$100–250/yr) removes that.

### Requirements to build (one time)

- [Rust](https://rustup.rs) (`rustup default stable-msvc`)
- Visual Studio Build Tools with "Desktop development with C++"
- WebView2 (present on Win11)

## Windows + macOS builds via GitHub Actions

`.github/workflows/release.yml` builds both platforms and publishes a **draft**
GitHub Release with the installers attached.

```bash
# bump "version" in package.json AND src-tauri/tauri.conf.json first, then:
git tag v0.1.1
git push origin v0.1.1
```

Watch it in the repo's **Actions** tab (~10–15 min). When done, open **Releases**,
review the draft, and click **Publish**. Downloads:

- **Windows** — `Expense Manager_x.y.z_x64-setup.exe` (NSIS). SmartScreen → *More info → Run anyway*.
- **macOS** — `Expense Manager_x.y.z_universal.dmg` (Apple Silicon + Intel). First launch: right-click the app → *Open* (Gatekeeper blocks unsigned apps on double-click).

Both are **unsigned**. Signing removes the warnings — Windows needs a code-signing
cert (~$100–250/yr); macOS needs the Apple Developer Program ($99/yr) for
notarization.

## Desktop dev

```bash
npm run app:dev    # launches the app in a native window with hot reload
```

## Plain web build

```bash
npm run build      # -> dist/  (static, relative paths, hash router)
npm run serve      # vite preview on 0.0.0.0:4173
```

## Data & backups

Each person's data is private to their machine. There is no sync. The portability
mechanism is **Settings → Export backup (.json)** / **Import backup** — use it to
move between machines or keep a safe copy.
