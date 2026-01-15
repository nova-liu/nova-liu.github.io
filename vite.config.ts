import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 核心：根据环境动态设置 base 路径
// 开发环境（dev）：base = '/'
// 生产环境（build）：base = '/仓库名/'（如果是 <用户名>.github.io 仓库则直接用 '/'）
const base =
  process.env.NODE_ENV === "production"
    ? "/nova-liu.github.io/" // 替换为你的实际仓库名
    : "/";

export default defineConfig({
  base: base, // 动态 base 路径
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // 可选：如果需要更精准的环境控制，也可以用 mode
  // defineConfig(({ mode }) => ({
  //   base: mode === 'production' ? '/nova-liu.github.io/' : '/',
  // }))
});
