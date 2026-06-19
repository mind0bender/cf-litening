# Codeforces Litening

Codeforces Litening is a browser extension that enhances the Codeforces experience with a modern dark theme and an integrated multi-language code execution environment.

The project consists of two parts:

- **Extension** — Provides the UI enhancements, dark theme, and in-browser compiler interface.
- **Execution Server** — A Bun-powered backend that securely compiles and executes code through WebSockets.

## Features

### 🌙 Dark Theme

A polished dark mode designed specifically for Codeforces, covering problem pages, contests, dashboards, blogs, and other commonly used sections.

### 💻 In-Browser Code Execution

Run and test solutions without leaving Codeforces.

**Supported languages:**

- C / C++
- JavaScript / TypeScript
- Python
- Rust
- Java

Features include:

- Custom input support
- Real-time compilation and execution output
- Error reporting
- Sample test case integration

### ⚡ High-Performance Backend

The execution server is built on Bun and uses native WebSockets for low-latency communication between the extension and the execution environment.

### 🔒 Secure Execution

Code execution is powered by `@mind0bender/code-runner`, providing isolated compilation and runtime environments for user submissions.

---

## Architecture

```text
Codeforces
    │
    ▼
CF Litening Extension
    │
    │ WebSocket
    ▼
Bun Execution Server
    │
    ▼
@mind0bender/code-runner
```

The extension communicates with the backend over WebSockets. The backend compiles and executes submitted code, then streams results back to the browser in real time.

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/mind0bender/cf-litening.git
cd cf-litening
```

### Extension

```bash
cd extension
bun install
bun run build
```

Load the generated build as an unpacked browser extension.

### Server

```bash
cd server
bun install
bun dev
```

For production:

```bash
bun start
```

### Requirements

- Bun
- Language toolchains available in your system PATH (e.g. `g++`, `python`, `rustc`, `node`, `javac`)

---

## Tech Stack

### Extension

- React (TypeScript)
- TailwindCSS
- CRXJS
- WebExtensions API (Manifest V3)

### Server

- Bun
- TypeScript
- WebSockets
- `@mind0bender/code-runner`

---

## Contributing

Contributions are welcome. Feel free to open issues, submit pull requests, or suggest new features.

---

## License

Distributed under the MIT License.
