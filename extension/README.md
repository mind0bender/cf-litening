# Codeforces Litening: Dark Theme & Executor

A lightweight browser extension designed to elevate your competitive programming experience on Codeforces. It brings a sleek, eye-friendly dark mode and a built-in compilation and execution environment directly in the Browser.

## Features

- **🌙 True Dark Theme:** Say goodbye to late-night eye strain. Enjoy a carefully designed, modern dark interface tailored specifically for Codeforces problem pages, dashboards, and blogs.
- **💻 Compile & Execute:** Test your solutions directly on the problem page. No need to constantly switch between your IDE and the browser.
  - Supports multiple languages (C/C++, JS/TS, Python, Rust, Java).
  - Custom input/output matching.
  - Fast execution with clear error reporting.

---

## Installation

### For Developers / Manual Installation

1. **Clone the Repository and Navigate to the Directory:**

   ```bash
   git clone https://github.com/mind0bender/cf-litening.git
   cd cf-litening/extension
   ```

1. **Install Dependencies and Build the Project**

   ```bash
   bun i
   bun run build
   ```

1. **Extract the Zip file from the `releases` Directory**

   ```bash
   # make sure to replace the <version> with in the command
   unzip releases/cf-litening-<version>.zip -d biuld-dist
   ```

1. **Open Extension Management Page:**
   Navigate to [about://extensions/](about://extensions)

1. **Enable Developer Mode:** Toggle the **Developer mode** switch in the top-right corner.

1. **Load Unpacked:** Click the **Load unpacked** button in the top-left and select the project extracted directory `build-dist` the folder containing `manifest.json`).

---

## How to Use

### 1. Toggling Dark Theme

The dark theme can be easily toggled on or off via the extension's popup menu in your browser toolbar.

### 2. Compiling and Running Code

1. Navigate to any Codeforces problem page.
1. Click on the **Cf-Litening** Extension Icon to Open its Popup Menu.
1. Click the **Compiler** Button on the Popup Menu.
1. Select your programming language, paste your code, and provide custom inputs (or let it auto-fetch sample test cases).
1. Click **Run Code**(top right) to see the compilation status and output in real-time.

---

## Tech Stack

- **Frontend:** React(TS), TailwindCSS, CRXJS
- **Extension API:** WebExtensions API (Manifest V3)
- **Backend/Execution API:** Custom backend Powered By [@mind0bender/code-runner](https://github.com/mind0bender/code-runner.git)

---

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

---

## Acknowledgments

- Inspired by the competitive programming community's need for a seamless UI.
- [Codeforces](https://codeforces.com/) for the amazing platform.
