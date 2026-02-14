<div align="center">

# 🛡️ AnchorGuard AI

### AI-Powered Reasoning Auditor for Solana Smart Contracts

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

*The first AI auditor that shows you **how** it thinks — not just what it finds.*

[🚀 Live Demo](https://anchorguard-ai.vercel.app) · [📖 Documentation](#-how-it-works) · [🐛 Report Bug](https://github.com/panzauto46-bot/AnchorGuard-AI/issues)

---

</div>

## 🧠 What is AnchorGuard AI?

**AnchorGuard AI** is an intelligent security auditor specifically designed for **Solana Anchor programs**. Unlike traditional static analysis tools, AnchorGuard AI uses a transparent **Chain-of-Thought (CoT) reasoning engine** that shows you exactly *how* it analyzes your smart contract — step by step, in real-time.

> 💡 **Why it matters:** In web3, security is non-negotiable. AnchorGuard AI doesn't just flag issues — it *explains* them with full reasoning traces, auto-generated fixes, and compute unit optimization suggestions.

---

## ✨ Key Features

### 🧠 Hybrid AI Engine
AnchorGuard runs on a dual-core AI architecture to balance speed and accuracy:
- **Speed Layer (Groq Llama 3):** Generates real-time "Thinking Process" logs, giving users immediate visual feedback (token streaming >800 t/s).
- **Brain Layer (Google Gemini 1.5 Pro):** Performs deep-dive security audits in the background, capable of understanding complex reentrancy paths and logic errors with massive context windows.

### 🛡️ Core Capabilities
| Feature | Description |
|---------|-------------|
| **Professional Editor** | Integrated **Monaco Editor** (VS Code engine) with custom Solana Rust syntax highlighting and dark/light themes. |
| **Multi-Program Analysis** | Tab-based file system — audit **multiple programs** simultaneously with **cross-program vulnerability detection** (CPI, PDA sharing, authority mismatches). |
| **Transparent AI Reasoning** | Watch the AI "think" through each vulnerability with full chain-of-thought reasoning steps displayed in real-time. |
| **Deep Vulnerability Scan** | Detects critical issues like missing signer checks, integer overflow, authority validation gaps, PDA issues, and cross-program invocation flaws. |
| **Secure Authentication** | **Hybrid Auth System**: Real login via **Google/GitHub** (Firebase) and **Wallet Connection** (Phantom/Solflare) for seamless Web2 & Web3 access. |
| **Auto-Fix & Diff View** | Generates instant code fixes with side-by-side diff comparison — vulnerable vs. secure code, one click to copy. |
| **Compute Unit Optimizer** | Analyzes compute unit efficiency and provides gas optimization suggestions specific to the Solana runtime. |
| **PDF & Markdown Export** | Download professional audit reports as **PDF** (dark-themed, color-coded) or **Markdown** (GitHub/Notion-ready). |
| **Audit History** | All past audits auto-saved to `localStorage` with scores, timestamps, and issue breakdowns — persistent across sessions. |
| **User Profile & Settings** | Real profile modal (Firebase/Wallet data), customizable AI model, Solana network, theme, and history preferences. |

---

## 🔑 Environment Setup
To enable the AI capabilities, you need to set up the following API keys in a `.env` file (or Vercel Environment Variables):

```bash
VITE_GROQ_API_KEY="your_groq_api_key"
VITE_GEMINI_API_KEY="your_gemini_api_key"
```
1. **Groq API:** Get it from [Groq Cloud](https://console.groq.com)
2. **Gemini API:** Get it from [Google AI Studio](https://aistudio.google.com)


---

## 🏗️ Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | React 19 | Latest version with hooks & concurrent features |
| **Language** | TypeScript 5.9 | Full type safety across the entire codebase |
| **Build Tool** | Vite 7 | Lightning-fast HMR and optimized builds |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom Solana theme tokens |
| **Auth (Web2)** | Firebase Auth | Secure Google & GitHub login integration |
| **Auth (Web3)** | Solana Wallet Adapter | Native connection for Phantom, Solflare, Backpack |
| **PDF Export** | jsPDF | Client-side PDF generation with dark-themed reports |
| **Icons** | Lucide React | Beautiful, consistent icon set |
| **Typography** | Inter + JetBrains Mono | Clean UI font paired with developer-grade monospace |
| **Deployment** | Vercel | Edge-optimized global deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/panzauto46-bot/AnchorGuard-AI.git

# Navigate to the project
cd AnchorGuard-AI

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🔬 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    AnchorGuard AI                        │
│                                                         │
│  ┌──────────────────┐     ┌────────────────────────────┐│
│  │                  │     │                            ││
│  │  Multi-Program   │────▶│  AI Reasoning Engine       ││
│  │  Editor (Tabs)   │     │                            ││
│  │                  │     │  1. Parse Anchor structs   ││
│  │  • program.rs    │     │  2. Analyze constraints    ││
│  │  • vault.rs      │     │  3. Check access control   ││
│  │  • token.rs      │     │  4. Detect arithmetic      ││
│  │  • + Add         │     │  5. Validate PDAs          ││
│  │                  │     │  6. Cross-program CPI      ││
│  └──────────────────┘     │  7. Optimize compute       ││
│                           │                            ││
│                           └──────────┬─────────────────┘│
│                                      │                  │
│                                      ▼                  │
│                           ┌────────────────────────────┐│
│                           │                            ││
│                           │  Audit Dashboard           ││
│                           │  • Security Score          ││
│                           │  • Vulnerability Cards     ││
│                           │  • Auto-Fix Diffs          ││
│                           │  • Gas Optimizations       ││
│                           │  • Export (PDF/MD)         ││
│                           │                            ││
│                           └──────────┬─────────────────┘│
│                                      │                  │
│                   ┌──────────────────┼──────────────┐   │
│                   ▼                  ▼              ▼   │
│           ┌──────────────┐  ┌──────────────┐  ┌───────┐│
│           │ Auth         │  │ History      │  │ User  ││
│           │ Google/GitHub│  │ localStorage │  │ Prefs ││
│           │ Phantom/Sol  │  │ Persistence  │  │ & Set ││
│           └──────────────┘  └──────────────┘  └───────┘│
└─────────────────────────────────────────────────────────┘
```

### Workflow

1. **Paste or Load** — Input your Solana/Anchor smart contract code (supports **multiple files** via tabs)
2. **Run AI Audit** — The reasoning engine processes all programs, including cross-program analysis
3. **Watch AI Think** — See the transparent Chain-of-Thought reasoning in the terminal
4. **Review Results** — Get a comprehensive dashboard with security score, vulnerabilities, fixes, and optimizations
5. **Export Report** — Download as **PDF** (professional dark-themed) or **Markdown** (GitHub/Notion-ready)

---

## 📁 Project Structure

```
AnchorGuard-AI/
├── index.html                  # Entry HTML
├── vite.config.ts              # Vite configuration + Node polyfills
├── vercel.json                 # Vercel deployment config
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
│
└── src/
    ├── main.tsx                # App entry point (WalletContext wrapped)
    ├── App.tsx                 # Root component (multi-file state, modals)
    ├── index.css               # Global styles & Tailwind theme
    ├── types.ts                # TypeScript type definitions
    │
    ├── services/
    │   ├── ai.ts               # Hybrid AI (Groq + Gemini) service
    │   ├── export.ts           # PDF & Markdown report generator
    │   └── firebase.ts         # Firebase Auth configuration
    │
    ├── components/
    │   ├── Header.tsx          # Navigation header with auth
    │   ├── Sidebar.tsx         # Multi-program tab system
    │   ├── CodeEditor.tsx      # Smart contract code editor
    │   ├── ThinkingTerminal.tsx # AI reasoning terminal display
    │   ├── AuditDashboard.tsx  # Security audit results + export
    │   ├── WelcomeScreen.tsx   # Landing/overview screen
    │   ├── VulnerabilityCard.tsx# Individual vulnerability display
    │   ├── GasOptimizer.tsx    # Compute unit optimizer
    │   ├── LoginModal.tsx      # Authentication modal
    │   ├── UserMenu.tsx        # User dropdown menu
    │   ├── ProfileModal.tsx    # User profile display
    │   ├── AuditHistoryModal.tsx# Audit history viewer
    │   └── SettingsModal.tsx   # App settings panel
    │
    ├── context/
    │   ├── AuthContext.tsx      # Auth state (Firebase + Wallet)
    │   ├── WalletContextProvider.tsx # Solana Wallet Adapter context
    │   └── ThemeContext.tsx     # Dark/Light theme management
    │
    ├── data/
    │   └── sampleCode.ts       # Sample Anchor program for demo
    │
    └── utils/
        └── cn.ts               # Tailwind class merge utility
```

---

## 🎨 Design System

AnchorGuard AI features a custom design system built around the **Solana brand colors**:

| Token | Color | Usage |
|-------|-------|-------|
| `solana-green` | `#14F195` | Primary accent (dark mode), success states |
| `solana-purple` | `#9945FF` | Primary accent (light mode), brand identity |
| `dark-bg` | `#09090B` | Dark mode background |
| `dark-surface` | `#111113` | Dark mode surface/cards |
| `critical` | `#EF4444` | Critical severity indicators |
| `high` | `#F97316` | High severity indicators |
| `medium` | `#EAB308` | Medium severity indicators |
| `safe` | `#22C55E` | Safe/passed indicators |

### Theme Support

Full **dark mode** and **light mode** support with smooth transitions, respecting the Solana ecosystem's visual language.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect the Vite framework
4. Click **Deploy** — done! 🎉

The `vercel.json` configuration handles:
- ✅ SPA routing (client-side navigation)
- ✅ Asset caching (1 year for hashed assets)
- ✅ Optimized build settings

---

## 🗺️ Roadmap

- [x] Core AI reasoning engine with Chain-of-Thought
- [x] Vulnerability detection (Signer, Arithmetic, Authority, PDA)
- [x] Auto-fix code generation with diff view
- [x] Compute unit optimization suggestions
- [x] Dark/Light theme support
- [x] **Secure Authentication** (Google, GitHub via Firebase)
- [x] Live Groq/Gemini integration for dynamic analysis
- [x] **Real Wallet Connection** (Phantom, Solflare, Backpack)
- [x] **Audit History & Persistence** (localStorage)
- [x] **Multi-Program Analysis** (tab system + cross-program CPI detection)
- [x] **PDF & Markdown Report Export** (jsPDF + .md download)
- [x] **User Profile & Settings** (real data, customizable preferences)
- [ ] IDE extensions (VS Code, Cursor)
- [ ] On-chain audit verification (Solana Program)
- [ ] Team collaboration & shared audits
- [ ] CI/CD integration (GitHub Actions)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for the Solana ecosystem**

*Securing smart contracts, one audit at a time.*

<br>

[![GitHub Stars](https://img.shields.io/github/stars/panzauto46-bot/AnchorGuard-AI?style=social)](https://github.com/panzauto46-bot/AnchorGuard-AI)

</div>
