# Codeforces Litening Server

The high-performance, lightweight backend execution engine for the **Codeforces Litening** browser extension. Built on top of **Bun** for ultra-fast WebSocket routing and powered by the `@mind0bender/code-runner` core for secure, isolated code compilation and execution.

## Features

- **⚡ Lightning Fast WebSockets:** Utilizes Bun's native, high-performance WebSocket implementation for real-time compilation and execution streaming.
- **🔒 Isolated Execution:** Securely executes arbitrary code submissions using [@mind0bender/code-runner](https://github.com/mind0bender/code-runner.git).
- **🌐 Multi-Language Support:** Seamlessly handles execution contexts for C/C++, JS/TS, Python, Rust, and Java.

---

## Prerequisites

Before running the server, ensure you have the following installed on your host machine:

- **Bun:** Get it at [bun.sh](https://bun.sh)
- **Compilers/Runtimes:** Ensure the CLI tools for the languages you want to support (e.g., `g++`, `python`, `rustc`, `node`, etc) are accessible in your system's `PATH`.

---

## Getting Started

### Installation

1. **Clone the Repository and Navigate to the Directory:**

   ```bash
   git clone https://github.com/mind0bender/cf-litening.git
   cd cf-litening/server
   ```

1. **Install Dependencies and Start the Server**

   ```bash
   bun i
   ```

1. **Development**

   ```bash
   bun dev
   ```

1. **Production**

   ```bash
   bun start
   ```

> By default, the server runs on <http://localhost:3000> (or your configured WebSocket port).

## Contributing

Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License.
