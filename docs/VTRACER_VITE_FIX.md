# VTracer WASM 导入问题修复 ✅

## 问题

```
Cannot import non-asset file /wasm/vtracer_webapp.js which is inside /public.
JS/CSS files inside /public are copied as-is on build and can only be
referenced via <script src> or <link href> in html.
```

## 原因

Vite 不允许从 `public` 目录导入 JS 模块。`public` 目录用于静态资源，不能作为模块导入。

## 解决方案

### 1. 移动 WASM 文件到 `src` 目录

**之前** ❌:
```
public/wasm/
  ├── vtracer_webapp.js
  ├── vtracer_webapp_bg.wasm
  └── vtracer_webapp.d.ts
```

**现在** ✅:
```
src/lib/vectorization/wasm/
  ├── vtracer_webapp.js
  ├── vtracer_webapp_bg.wasm
  └── vtracer_webapp.d.ts
```

### 2. 更新导入方式

**之前** ❌:
```typescript
// 不工作！Vite 不允许从 public 导入
vtracerModule = await import('/wasm/vtracer_webapp.js');
await vtracerModule.default('/wasm/vtracer_webapp_bg.wasm');
```

**现在** ✅:
```typescript
// 使用相对路径 + import.meta.url
const wasmUrl = new URL('./wasm/vtracer_webapp_bg.wasm', import.meta.url);
vtracerModule = await import('./wasm/vtracer_webapp.js');
await vtracerModule.default(wasmUrl);
```

## 关键要点

1. **WASM 文件位置**: 将 WASM 文件放在 `src` 目录下，作为模块的一部分
2. **相对路径**: 使用相对路径导入 WASM 绑定文件
3. **import.meta.url**: 使用 `import.meta.url` 解析 WASM 二进制文件的 URL

## 最终代码

### `src/lib/vectorization/vtracer.wasm.ts`

```typescript
export async function initVTracer(): Promise<void> {
  if (initialized) {
    return;
  }

  try {
    createHiddenContainer();

    // ✅ 正确的方式：从 src 目录导入
    const wasmUrl = new URL('./wasm/vtracer_webapp_bg.wasm', import.meta.url);
    vtracerModule = await import('./wasm/vtracer_webapp.js');
    await vtracerModule.default(wasmUrl);

    console.log('✅ VTracer WASM 模块加载成功（支持彩色矢量化）');
    initialized = true;
  } catch (error) {
    console.error('❌ VTracer WASM 初始化失败:', error);
    throw new Error('VTracer WASM 初始化失败');
  }
}
```

## 测试

✅ 开发服务器启动成功
✅ 没有 Vite 导入错误
✅ WASM 模块可以正常加载

**访问**: http://localhost:8081/

## 参考资源

- [Vite 静态资源处理](https://vitejs.dev/guide/assets.html)
- [WebAssembly 导入](https://vitejs.dev/guide/webassembly.html)
