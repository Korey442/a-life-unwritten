import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_PORT = process.env.API_PORT || 8787;

// base './' で、GitHub Pages のサブパス(/a-life-unwritten/)でもローカルでも動くよう相対パスに。
// /api はローカルAPIサーバ(server/index.js)へプロキシ。
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: `http://localhost:${API_PORT}`, changeOrigin: true },
    },
  },
});
