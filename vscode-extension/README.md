# 🛡️ AnchorGuard AI — VS Code Extension

> AI-Powered Security Auditor for Solana Anchor Programs — now inside your editor.

## ✨ Features

- **🧠 Dual-AI Engine** — Groq Llama 3.3 (speed) + DeepSeek V3 (depth, FREE)
- **📍 Inline Diagnostics** — Squiggly lines on vulnerable code lines
- **📊 Results Panel** — Beautiful audit dashboard inside VS Code
- **🔍 Multi-Program** — Audit all `.rs` files in your workspace
- **⌨️ Keyboard Shortcut** — `Ctrl+Shift+A` to audit instantly
- **🔄 Auto-Audit** — Optionally audit on every save
- **🔧 Quick Fix** — See vulnerable vs. fixed code side-by-side

## 🚀 Quick Start

### 1. Install the Extension
```bash
cd vscode-extension
npm install
npm run compile
```

### 2. Set API Keys
Open VS Code Settings (`Ctrl+,`) and search for `AnchorGuard`:
- **DeepSeek API Key** (required, FREE) — [Get it from DeepSeek Platform](https://platform.deepseek.com)
- **Groq API Key** (optional, for thinking trace) — [Get it from Groq Cloud](https://console.groq.com)

### 3. Audit Your Code
- Open any `.rs` file
- Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
- Or right-click → **"AnchorGuard: Audit Current File"**

## 📋 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `AnchorGuard: Audit Current File` | `Ctrl+Shift+A` | Audit the active Rust file |
| `AnchorGuard: Audit Selection` | — | Audit selected code only |
| `AnchorGuard: Audit All Anchor Programs` | — | Scan all `.rs` files in `programs/` |
| `AnchorGuard: Clear Diagnostics` | — | Clear all inline warnings |
| `AnchorGuard: Open Web Dashboard` | — | Open the web app |

## ⚙️ Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `anchorguard.deepseekApiKey` | `""` | DeepSeek API key for deep audit (FREE) |
| `anchorguard.groqApiKey` | `""` | Groq API key for thinking trace |
| `anchorguard.autoAuditOnSave` | `false` | Auto-audit on file save |
| `anchorguard.severityFilter` | `"all"` | Min severity to show (`all`/`critical`/`high`/`medium`) |
| `anchorguard.showThinkingProcess` | `true` | Show AI thinking in Output channel |

## 🖼️ How It Works

```
┌──────────────────────────────────────────┐
│  VS Code / Cursor                        │
│                                          │
│  ┌────────────┐    ┌──────────────────┐  │
│  │ Rust File  │───▶│ AnchorGuard AI   │  │
│  │ (Editor)   │    │                  │  │
│  │            │◀───│ 1. Groq Thinking │  │
│  │ ~~~ error  │    │ 2. DeepSeek Audit│  │
│  │ ~~~ warn   │    │ 3. Diagnostics   │  │
│  └────────────┘    └──────────────────┘  │
│                           │              │
│                    ┌──────▼───────────┐   │
│                    │ Results Panel    │   │
│                    │ • Score: 65/100  │   │
│                    │ • 3 Critical     │   │
│                    │ • Code Diffs     │   │
│                    └─────────────────┘   │
└──────────────────────────────────────────┘
```

## 🔧 Development

```bash
# Install dependencies
cd vscode-extension
npm install

# Compile
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Package as .vsix
npm run package
```

### Testing in VS Code
1. Open the `vscode-extension/` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Open a `.rs` file and run the audit command

### Testing in Cursor
1. Package the extension: `npm run package`
2. In Cursor: `Ctrl+Shift+P` → "Install from VSIX"
3. Select the generated `.vsix` file

## 📦 Publishing

```bash
# Login to VS Code Marketplace
npx vsce login anchorguard

# Publish
npm run publish
```

## 🤝 Compatibility

| IDE | Supported |
|-----|-----------|
| VS Code | ✅ Full support |
| Cursor | ✅ Full support (VS Code fork) |
| VSCodium | ✅ Compatible |
| Windsurf | ✅ Compatible |

---

**Built with ❤️ for the Solana ecosystem**
