import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 针对 <用户名>.github.io 仓库的简化配置
export default defineConfig({
  base: "/", // 无论开发/生产都用 '/'
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
