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
    server: {
      host: "::",
      port: 8080,
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
      }
    },
    optimizeDeps: {
      exclude: ['src/reference/enter_AIIcon'],
      entries: ['index.html', '!src/reference/enter_AIIcon/**/*']
    }
  };
});