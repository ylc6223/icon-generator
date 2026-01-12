import { VectorizationPreset } from '@/stores/workbench-store';

/**
 * VTracer WASM 矢量化模块
 * 使用 vectortracer 包提供的 WebAssembly 绑定
 */

// 导入 vectortracer
// @ts-ignore - vectortracer 可能没有完整的 TypeScript 类型
let vtracerModule: any = null;

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
    console.log('VTracer WASM module loaded successfully');
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
        // 创建 Canvas 来获取图像数据
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取 Canvas 2D 上下文'));
          return;
        }

        // 根据预设调整缩放
        const scaleFactor = preset.name === 'detailed' ? 2 : 1;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        ctx.imageSmoothingEnabled = preset.name !== 'detailed';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 获取 ImageData
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);

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
