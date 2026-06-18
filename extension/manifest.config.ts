import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
    },
    default_popup: "src/popup/index.html",
  },
  permissions: ["sidePanel", "contentSettings", "storage", "tabs", "activeTab"],
  content_scripts: [
    {
      js: ["src/content/main.tsx"],
      matches: ["https://codeforces.com/*"],
      run_at: "document_idle",
    },
    {
      js: ["src/content/views/App.css"],
      matches: ["https://codeforces.com/*"],
      run_at: "document_start",
    },
  ],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  web_accessible_resources: [
    {
      resources: ["src/assets/*"],
      matches: ["<all_urls>"],
    },
  ],
});
