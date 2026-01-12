import { VTRACER_PRESETS, getActivePreset } from '@/lib/vtracer-presets';

/**
 * VTracer WASM 矢量化模块（彩色版本）
 * 使用官方 visioncortex/vtracer WASM 构建
 *
 * 支持彩色图像矢量化！
 */

// @ts-ignore - vtracer WASM 模块类型
let vtracerModule: any = null;
let initialized = false;

// 唯一的容器 ID（在主线程使用）
const VTRACER_CONTAINER_ID = 'vtracer-hidden-container';
const CANVAS_ID = 'vtracer-canvas';
const SVG_ID = 'vtracer-svg';

// 保存原始 console.log
const originalConsoleLog = console.log;

// 当前激活的 VTracer 预设
let currentVTracerPreset = getActivePreset();

/**
 * 设置 VTracer 预设（可在运行时切换）
 */
export function setVTracerPreset(presetName: string): void {
  if (VTRACER_PRESETS[presetName]) {
    currentVTracerPreset = VTRACER_PRESETS[presetName];
    console.log(`✅ VTracer 预设已切换到: ${presetName}`);
  } else {
    console.warn(`⚠️ 未找到预设 "${presetName}"，使用默认预设`);
    currentVTracerPreset = getActivePreset();
  }
}

/**
 * 获取当前 VTracer 预设
 */
export function getCurrentVTracerPreset() {
  return currentVTracerPreset;
}

/**
 * 创建隐藏的 DOM 容器用于 vtracer
 */
function createHiddenContainer(): void {
  if (typeof document === 'undefined') {
    throw new Error('VTracer 彩色模式需要在主线程运行');
  }

  if (document.getElementById(VTRACER_CONTAINER_ID)) {
    return; // 已存在
  }

  const container = document.createElement('div');
  container.id = VTRACER_CONTAINER_ID;
  container.style.display = 'none';
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';

  const canvas = document.createElement('canvas');
  canvas.id = CANVAS_ID;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = SVG_ID;
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  container.appendChild(canvas);
  container.appendChild(svg);
  document.body.appendChild(container);

  // 拦截 console.log 过滤 VTracer 的调试消息
  console.log = (...args: any[]) => {
    const message = args[0];
    // 过滤掉 VTracer 的调试消息
    if (
      typeof message === 'string' &&
      (message.includes('Clustering tick') ||
       message.includes('Reclustering tick') ||
       message.includes('Vectorize tick') ||
       message.includes('Multiply coordinates') ||
       message.includes('original') && message.includes('displayed'))
    ) {
      return; // 不输出这些调试消息
    }
    originalConsoleLog.apply(console, args);
  };
}

/**
 * 初始化 VTracer WASM 模块
 * 应该在应用启动时调用一次
 */
export async function initVTracer(): Promise<void> {
  if (initialized) {
    console.log('⏭️ VTracer 已经初始化，跳过');
    return; // 已经初始化
  }

  console.log('🔧 开始初始化 VTracer WASM...');

  try {
    // 创建隐藏容器
    console.log('📦 创建隐藏容器...');
    createHiddenContainer();
    console.log('✅ 隐藏容器已创建');

    // 动态导入 vtracer WASM（从 src 目录）
    console.log('📦 加载 WASM 文件...');
    const wasmUrl = new URL('./wasm/vtracer_webapp_bg.wasm', import.meta.url);
    console.log('✅ WASM URL:', wasmUrl.toString());

    console.log('📦 导入 vtracer_webapp.js...');
    vtracerModule = await import('./wasm/vtracer_webapp.js');
    console.log('✅ vtracer_webapp.js 已加载');

    console.log('📦 初始化 WASM 模块...');
    await vtracerModule.default(wasmUrl);
    console.log('✅ WASM 模块初始化成功');

    console.log('✅ VTracer WASM 模块加载成功（支持彩色矢量化）');
    initialized = true;
  } catch (error) {
    console.error('❌ VTracer WASM 初始化失败:', error);
    throw new Error(`VTracer WASM 初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 将预设配置转换为 VTracer ColorImageConverter 参数
 * 参考：https://github.com/visioncortex/vtracer
 */
function presetToVTracerParams(): string {
  // 使用当前激活的 VTracer 预设配置
  const vtracerConfig = currentVTracerPreset;

  const params = {
    canvas_id: CANVAS_ID,
    svg_id: SVG_ID,
    mode: 'spline',
    hierarchical: 'stacked',
    corner_threshold: vtracerConfig.corner_threshold,
    length_threshold: vtracerConfig.length_threshold,
    max_iterations: vtracerConfig.max_iterations,
    splice_threshold: vtracerConfig.splice_threshold,
    filter_speckle: vtracerConfig.filter_speckle,
    color_precision: vtracerConfig.color_precision,
    layer_difference: vtracerConfig.layer_difference,
    path_precision: 1, // 固定为 1，因为 VTracer 的 path_precision 范围是 1-3
  };

  console.log(`📋 VTracer 配置（${vtracerConfig.displayName} 模式）:`, JSON.stringify(params, null, 2));
  return JSON.stringify(params);
}

/**
 * 使用 VTracer WASM 将位图转换为彩色 SVG
 * @param imageData base64 编码的图像数据
 * @returns SVG 字符串
 */
export async function traceWithVTracer(
  imageData: string
): Promise<string> {
  console.log('🎯 VTracer: 开始矢量化...');

  if (!vtracerModule || !initialized) {
    console.error('❌ VTracer 模块未初始化');
    throw new Error('VTracer WASM 模块未初始化。请先调用 initVTracer()。');
  }

  if (typeof document === 'undefined') {
    console.error('❌ document 对象不存在');
    throw new Error('VTracer 彩色模式需要在主线程运行');
  }

  // 确保 Image 对象可用
  if (typeof Image === 'undefined') {
    console.error('❌ Image 对象不存在');
    throw new Error('当前环境不支持 Image 对象');
  }

  console.log('✅ VTracer 环境检查通过');

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        console.log('✅ 图像加载成功，尺寸:', img.width, 'x', img.height);

        // 获取 canvas 元素
        const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
        const svgElement = document.getElementById(SVG_ID) as SVGSVGElement;

        if (!canvas || !svgElement) {
          console.error('❌ VTracer 容器未找到');
          reject(new Error('VTracer 容器未找到'));
          return;
        }

        console.log('✅ VTracer 容器已找到');

        // 设置 canvas 尺寸（根据当前预设）
        const scaleFactor = currentVTracerPreset.name === 'ultra' ? 2 : 1;
        const width = img.width * scaleFactor;
        const height = img.height * scaleFactor;

        canvas.width = width;
        canvas.height = height;

        console.log('✅ Canvas 尺寸设置为:', width, 'x', height);

        // 绘制图像到 canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('❌ 无法获取 Canvas 2D 上下文');
          reject(new Error('无法获取 Canvas 2D 上下文'));
          return;
        }

        ctx.imageSmoothingEnabled = currentVTracerPreset.name !== 'ultra';
        ctx.drawImage(img, 0, 0, width, height);

        console.log('✅ 图像已绘制到 Canvas');

        // 清空 SVG
        while (svgElement.firstChild) {
          svgElement.removeChild(svgElement.firstChild);
        }

        // 设置 SVG 元素的属性
        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', height.toString());
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);

        console.log('✅ SVG 容器已清空并设置属性');

        // 创建 ColorImageConverter
        const paramsStr = presetToVTracerParams();

        // 使用静态方法 new_with_string 创建 ColorImageConverter
        console.log('🔧 创建 ColorImageConverter...');
        const converter = vtracerModule.ColorImageConverter.new_with_string(paramsStr);
        console.log('✅ ColorImageConverter 已创建');

        // 执行矢量化（使用 tick 循环）
        console.log('🚀 调用 converter.init()...');
        converter.init();
        console.log('✅ converter.init() 完成');
        let done = false;
        let tickCount = 0;

        const tick = () => {
          try {
            tickCount++;
            done = converter.tick();

            if (!done) {
              // 使用 setTimeout 避免阻塞 UI
              if (tickCount % 10 === 0) {
                console.log(`⏳ VTracer 处理中... (${tickCount} ticks)`);
              }
              setTimeout(tick, 0);
            } else {
              console.log(`✅ VTracer 处理完成，总 ticks: ${tickCount}`);

              // 完成！获取 SVG 内容
              const serializer = new XMLSerializer();
              const svgString = serializer.serializeToString(svgElement);

              console.log('✅ SVG 序列化完成，长度:', svgString.length);

              // 清理
              converter.free();

              // 解析 SVG 字符串，提取内部内容
              // VTracer 生成的 SVG 可能已经包含完整的标签
              let innerContent = svgString;

              // 移除开头的 <svg ...> 标签
              const svgStartIndex = innerContent.indexOf('>');
              if (svgStartIndex > 0) {
                innerContent = innerContent.substring(svgStartIndex + 1);
              }

              // 移除结尾的 </svg> 标签
              const svgEndIndex = innerContent.lastIndexOf('</svg>');
              if (svgEndIndex >= 0) {
                innerContent = innerContent.substring(0, svgEndIndex);
              }

              // 构建最终的 SVG
              const result = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
${innerContent}
</svg>`;

              console.log('✅ VTracer 矢量化成功');
              console.log('📄 最终 SVG 长度:', result.length);
              resolve(result);
            }
          } catch (error) {
            console.error('❌ VTracer tick 处理错误:', error);
            converter.free();
            reject(error);
          }
        };

        // 开始处理
        console.log('🚀 开始 VTracer tick 循环...');
        setTimeout(tick, 0);

      } catch (error) {
        console.error('❌ VTracer 处理错误:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      console.error('❌ 图像加载失败');
      reject(new Error('图像加载失败'));
    };

    console.log('📤 开始加载图像...');
    img.src = imageData;
  });
}

/**
 * 检查 VTracer WASM 是否已初始化
 */
export function isVTracerReady(): boolean {
  return initialized && vtracerModule !== null;
}

/**
 * 获取 VTracer 模块信息
 */
export function getVTracerInfo(): { loaded: boolean; colorMode: boolean; version: string | null } {
  return {
    loaded: initialized && vtracerModule !== null,
    colorMode: true, // 支持彩色！
    version: '0.4.0', // vtracer-webapp 版本
  };
}
