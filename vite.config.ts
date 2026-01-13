import { defineConfig, PluginOption } from "vite";
import { enterDevPlugin, enterProdPlugin } from 'vite-plugin-enter-dev';
import path from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    ...enterProdPlugin(),
    wasm(),
    topLevelAwait(),
  ];
  if (mode === 'development') {
    plugins.push(...enterDevPlugin());
  }
  return {
    // 在顶层添加 assetsInclude 配置
    assetsInclude: ['**/*.wasm', '**/*.lottie'],
    server: {
      host: "::",
      port: 8080,
      fs: {
        // 允许访问 public 目录下的 WASM 文件
        allow: ['..'],
      },
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/',
    worker: {
      format: 'es',
      plugins: () => [
        wasm(),
        topLevelAwait(),
      ].filter(Boolean) as PluginOption[],
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        onwarn(warning, warn) {
          // 忽略 reference 目录的警告
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' || warning.message.includes('reference/enter_AIIcon')) {
            return;
          }
          warn(warning);
        }
      },
      // 确保 WASM 和 lottie 文件被正确复制
      assetsInclude: ['**/*.wasm', '**/*.lottie'],
    },
    optimizeDeps: {
      exclude: ['src/reference/enter_AIIcon'],
      entries: ['index.html', '!src/reference/enter_AIIcon/**/*']
    }
  };
});