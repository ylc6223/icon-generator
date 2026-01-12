import { VectorizationPreset } from '@/stores/workbench-store';

/**
 * VTracer WASM 矢量化模块
 * 使用 vectortracer 包提供的 WebAssembly 绑定
 *
 * 支持主线程和 Worker 环境：
 * - 主线程：使用 document.createElement('canvas')
 * - Worker：使用 OffscreenCanvas
 */

// 导入 vectortracer
// @ts-ignore - vectortracer 可能没有完整的 TypeScript 类型
let vtracerModule: any = null;

/**
 * 检查是否在 Worker 环境中
 */
function isWorkerContext(): boolean {
  return (
    typeof self !== 'undefined' &&
    typeof self.importScripts === 'function' &&
    typeof (self as any).window === 'undefined'
  );
}

/**
 * 创建 Canvas（支持主线程和 Worker）
 */
function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
} {
  if (isWorkerContext()) {
    // Worker 环境使用 OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  } else {
    // 主线程使用普通 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
  }
}

/**
 * 初始化 VTracer WASM 模块
 * 应该在应用启动时调用一次
 */
export async function initVTracer(): Promise<void> {
  if (vtracerModule) {
    return; // 已经初始化
  }

  try {
    // 动态导入 vectortracer
    vtracerModule = await import('vectortracer');
    const context = isWorkerContext() ? 'Worker' : 'Main Thread';
    console.log(`VTracer WASM module loaded successfully in ${context}`);
  } catch (error) {
    console.error('Failed to load VTracer WASM module:', error);
    throw new Error('VTracer WASM 初始化失败');
  }
}

/**
 * 将预设配置转换为 VTracer 参数
 */
function presetToVTracerParams(preset: VectorizationPreset) {
  return {
    // 颜色数量
    colorCount: preset.colorCount,

    // 最小区域（对应 minArea）
    minArea: preset.minArea,

    // 描边宽度（对应 strokeWidth）
    strokeWidth: preset.strokeWidth,

    // 路径简化阈值
    // 根据预设调整简化参数
    simplifyTolerance: preset.name === 'clean' ? 1.0 : preset.name === 'detailed' ? 0.1 : 0.5,

    // 轮廓寻找参数
    contourSmoothing: preset.name === 'detailed' ? 0 : 0.5,
  };
}

/**
 * 使用 VTracer WASM 将位图转换为 SVG
 * 支持主线程和 Worker 环境
 * @param imageData base64 编码的图像数据
 * @param preset 矢量化预设
 * @returns SVG 字符串
 */
export async function traceWithVTracer(
  imageData: string,
  preset: VectorizationPreset
): Promise<string> {
  if (!vtracerModule) {
    throw new Error('VTracer WASM module not initialized. Call initVTracer() first.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // 根据预设调整缩放
        const scaleFactor = preset.name === 'detailed' ? 2 : 1;
        const width = img.width * scaleFactor;
        const height = img.height * scaleFactor;

        // 创建 Canvas（自动适配主线程或 Worker）
        const { canvas, ctx } = createCanvas(width, height);

        if (!ctx) {
          reject(new Error('无法获取 Canvas 2D 上下文'));
          return;
        }

        // 设置 canvas 尺寸
        if ('width' in canvas) {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.imageSmoothingEnabled = preset.name !== 'detailed';
        ctx.drawImage(img, 0, 0, width, height);

        // 获取 ImageData
        const imageDataObj = ctx.getImageData(0, 0, width, height);

        // 转换为 VTracer 需要的格式
        const params = presetToVTracerParams(preset);

        // 调用 vectortracer 进行矢量化
        // vectortracer 的 API: trace(imageData, options)
        const svg = vtracerModule.default(
          imageDataObj,
          params
        );

        if (!svg || typeof svg !== 'string') {
          reject(new Error('VTracer 返回了无效的 SVG'));
          return;
        }

        resolve(svg);
      } catch (error) {
        console.error('VTracer tracing error:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图像加载失败'));
    };

    img.src = imageData;
  });
}

/**
 * 检查 VTracer WASM 是否已初始化
 */
export function isVTracerReady(): boolean {
  return vtracerModule !== null;
}

/**
 * 获取 VTracer 模块信息
 */
export function getVTracerInfo(): { loaded: boolean; version: string | null } {
  return {
    loaded: vtracerModule !== null,
    version: vtracerModule?.version || null,
  };
}
