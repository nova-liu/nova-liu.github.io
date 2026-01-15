import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 核心：base路径配置
  // 规则：
  // - 如果是 <用户名>.github.io 仓库：base: '/'
  // - 如果是普通仓库：base: '/<仓库名称>/'
  base: "/nova-liu.github.io/", // 替换为你的仓库名，例如 '/vite-react-ts-demo/'

  plugins: [react()],
  build: {
    outDir: "dist", // 输出目录，保持默认即可
    emptyOutDir: true,
  },
});
