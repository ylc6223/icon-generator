import { BoundingBox, VectorizationResult } from '@/stores/workbench-store';
import { traceWithVTracer, initVTracer, isVTracerReady } from './vectorization/vtracer.wasm';

// 环境变量：是否启用备用矢量化算法（默认关闭）
const ENABLE_FALLBACK_VECTORIZER = import.meta.env.VITE_ENABLE_FALLBACK_VECTORIZER === 'true';

// 初始化 VTracer WASM（在模块加载时执行）
let vtracerInitialized = false;

async function ensureVTracerInitialized() {
  if (!vtracerInitialized) {
    console.log('🔧 开始初始化 VTracer WASM...');
    try {
      await initVTracer();
      vtracerInitialized = true;
      console.log('✅ VTracer WASM 初始化成功');
    } catch (error) {
      console.error('❌ VTracer WASM 初始化失败:', error);
      throw new Error(`VTracer WASM 初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

/**
 * 检测图片中的图标网格
 * @param imageData base64编码的图片
 * @param rows 行数
 * @param cols 列数
 * @returns 检测到的边界框数组
 */
export async function detectIconsInImage(
  imageData: string,
  rows: number,
  cols: number
): Promise<BoundingBox[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`🔍 检测图标: 图片尺寸 ${img.width}x${img.height}, 网格 ${rows}x${cols}`);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const cellWidth = Math.floor(img.width / cols);
      const cellHeight = Math.floor(img.height / rows);
      console.log(`📐 单元格尺寸: ${cellWidth}x${cellHeight}`);

      const boxes: BoundingBox[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellWidth;
          const y = row * cellHeight;

          // Extract the cell as image data
          const cellCanvas = document.createElement('canvas');
          const cellCtx = cellCanvas.getContext('2d');
          if (!cellCtx) continue;

          cellCanvas.width = cellWidth;
          cellCanvas.height = cellHeight;
          cellCtx.drawImage(
            img,
            x, y, cellWidth, cellHeight,
            0, 0, cellWidth, cellHeight
          );

          const imageDataUrl = cellCanvas.toDataURL('image/png');

          boxes.push({
            id: `box-${row}-${col}`,
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            imageData: imageDataUrl,
          });
        }
      }

      console.log(`✅ 生成了 ${boxes.length} 个边界框`);
      resolve(boxes);
    };
    img.src = imageData;
  });
}

/**
 * 将位图转换为SVG (使用VTracer WASM)
 * @param imageData 图标的base64数据
 * @returns SVG字符串
 */
export async function imageToSvg(
  imageData: string
): Promise<string> {
  console.log('🎨 开始矢量化图像...');

  // 确保 VTracer 已初始化
  await ensureVTracerInitialized();

  // 检查 VTracer 是否可用
  if (!isVTracerReady()) {
    const errorMsg = 'VTracer WASM 未初始化，无法进行矢量化';
    console.error('❌', errorMsg);

    if (ENABLE_FALLBACK_VECTORIZER) {
      console.warn('⚠️ 备用算法已启用，使用备用矢量化算法');
      return await imageToSvgFallback(imageData);
    }

    throw new Error(errorMsg);
  }

  console.log('✅ VTracer 已就绪，开始矢量化...');

  try {
    const svg = await traceWithVTracer(imageData);
    console.log('✅ 矢量化完成，SVG 长度:', svg.length);
    return svg;
  } catch (error) {
    console.error('❌ VTracer 矢量化失败:', error);

    // 只有在环境变量启用时才使用备用算法
    if (ENABLE_FALLBACK_VECTORIZER) {
      console.warn('⚠️ 备用算法已启用，降级到备用矢量化算法');
      return await imageToSvgFallback(imageData);
    }

    throw new Error(`矢量化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 备用矢量化算法（当 VTracer 不可用时使用）
 * 使用简单的 potrace 算法
 */
async function imageToSvgFallback(
  imageData: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      const scaleFactor = 2;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 获取图像数据并生成SVG
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const svg = traceToSvg(imgData);

      resolve(svg);
    };
    img.src = imageData;
  });
}

/**
 * 矢量化单个图标并返回完整结果
 * @param imageData 图标的base64数据
 * @returns 矢量化结果
 */
export async function vectorizeIcon(
  imageData: string
): Promise<VectorizationResult> {
  const svg = await imageToSvg(imageData);

  // 计算 SVG 文件大小
  const fileSize = new Blob([svg]).size;

  // 计算路径数量
  const pathCount = (svg.match(/<path/g) || []).length;

  // 检查质量问题
  const warnings: string[] = [];
  if (pathCount > 500) {
    warnings.push('路径复杂度过高，可能影响性能');
  }
  if (fileSize > 50 * 1024) {
    warnings.push('SVG文件较大，可能影响加载速度');
  }
  if (pathCount === 0) {
    warnings.push('未检测到任何路径');
  }

  return {
    svg,
    pathCount,
    fileSize,
    warnings,
  };
}

/**
 * 批量矢量化图标（在主线程顺序处理，因为 VTracer WASM 需要 DOM）
 * @param images 图标数组
 * @param onProgress 进度回调
 * @returns 矢量化结果数组
 */
export async function batchVectorize(
  images: string[],
  onProgress?: (current: number, total: number) => void
): Promise<VectorizationResult[]> {
  const allResults: VectorizationResult[] = [];

  // 由于 VTracer WASM 需要主线程 DOM，改为顺序处理
  for (let i = 0; i < images.length; i++) {
    try {
      const result = await vectorizeIcon(images[i]);
      allResults.push(result);

      // 更新进度
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`图标 ${i} 矢量化失败:`, error);
      // 添加一个失败的结果，避免索引错位
      allResults.push({
        svg: '',
        pathCount: 0,
        fileSize: 0,
        warnings: [`矢量化失败: ${error instanceof Error ? error.message : '未知错误'}`],
      });
    }
  }

  return allResults;
}

/**
 * 简单的图像追踪转SVG（临时实现，将被VTracer WASM替代）
 */
function traceToSvg(
  imageData: ImageData
): string {
  const { width, height, data } = imageData;

  const threshold = 128;

  // 创建二值化表示
  const binary: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    binary[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // 检查像素是否为前景
      const brightness = (r + g + b) / 3;
      const isBackground = brightness > threshold || a < 128;
      binary[y][x] = !isBackground;
    }
  }

  // 生成路径
  const paths = generatePaths(binary, width, height);

  // 简化路径
  const simplifiedPaths = paths.map(path => simplifyPath(path, 1));

  const pathStrings = simplifiedPaths
    .filter(p => p.length > 2)
    .map(path => {
      if (path.length === 0) return '';
      let d = `M ${path[0].x} ${path[0].y}`;
      for (let i = 1; i < path.length; i++) {
        d += ` L ${path[i].x} ${path[i].y}`;
      }
      d += ' Z';
      return d;
    })
    .filter(d => d.length > 0);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor">
  <path d="${pathStrings.join(' ')}" fill-rule="evenodd"/>
</svg>`;
}

interface Point {
  x: number;
  y: number;
}

function generatePaths(binary: boolean[][], width: number, height: number): Point[][] {
  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    visited[y] = new Array(width).fill(false);
  }

  const paths: Point[][] = [];

  // 简单的轮廓追踪
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (binary[y][x] && !visited[y][x]) {
        // 检查是否为边缘像素
        const isEdge = !binary[y-1][x] || !binary[y+1][x] ||
                       !binary[y][x-1] || !binary[y][x+1];

        if (isEdge) {
          const path = traceContour(binary, visited, x, y, width, height);
          if (path.length > 4) {
            paths.push(path);
          }
        }
        visited[y][x] = true;
      }
    }
  }

  return paths;
}

function traceContour(
  binary: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  width: number,
  height: number
): Point[] {
  const path: Point[] = [];
  const directions = [
    [0, -1], [1, -1], [1, 0], [1, 1],
    [0, 1], [-1, 1], [-1, 0], [-1, -1]
  ];

  let x = startX;
  let y = startY;
  let dir = 0;
  let steps = 0;
  const maxSteps = width * height;

  do {
    path.push({ x, y });
    visited[y][x] = true;

    // 查找下一个边缘像素
    let found = false;
    for (let i = 0; i < 8; i++) {
      const newDir = (dir + i) % 8;
      const nx = x + directions[newDir][0];
      const ny = y + directions[newDir][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (binary[ny][nx]) {
          const isEdge = nx === 0 || nx === width - 1 || ny === 0 || ny === height - 1 ||
                        !binary[ny-1][nx] || !binary[ny+1][nx] ||
                        !binary[ny][nx-1] || !binary[ny][nx+1];

          if (isEdge && !visited[ny][nx]) {
            x = nx;
            y = ny;
            dir = (newDir + 5) % 8;
            found = true;
            break;
          }
        }
      }
    }

    if (!found) break;
    steps++;
  } while ((x !== startX || y !== startY) && steps < maxSteps);

  return path;
}

function simplifyPath(path: Point[], tolerance: number): Point[] {
  if (path.length <= 2) return path;

  // Douglas-Peucker简化算法
  const sqTolerance = tolerance * tolerance;

  function getSqDist(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return dx * dx + dy * dy;
  }

  function getSqSegDist(p: Point, p1: Point, p2: Point): number {
    let x = p1.x, y = p1.y;
    let dx = p2.x - x, dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    const dx2 = p.x - x;
    const dy2 = p.y - y;
    return dx2 * dx2 + dy2 * dy2;
  }

  function simplifyDPStep(points: Point[], first: number, last: number, sqTol: number, simplified: Point[]): void {
    let maxSqDist = sqTol;
    let index = 0;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTol) {
      if (index - first > 1) simplifyDPStep(points, first, index, sqTol, simplified);
      simplified.push(points[index]);
      if (last - index > 1) simplifyDPStep(points, index, last, sqTol, simplified);
    }
  }

  const simplified = [path[0]];
  simplifyDPStep(path, 0, path.length - 1, sqTolerance, simplified);
  simplified.push(path[path.length - 1]);

  return simplified;
}

/**
 * 导出选中的图标为ZIP文件
 * @param boxes 边界框数组
 * @param vectorizedIcons 矢量化结果Map
 * @param iconLabels 图标标签Map
 * @returns ZIP文件Blob
 */
export async function exportIconsAsZip(
  boxes: BoundingBox[],
  vectorizedIcons: Map<string, VectorizationResult>,
  iconLabels: Map<string, string>
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const box of boxes) {
    // 获取已矢量化的SVG或生成新的
    let result = vectorizedIcons.get(box.id);

    if (!result && box.imageData) {
      result = await vectorizeIcon(box.imageData);
    }

    if (result) {
      // 使用标签作为文件名，如果没有标签则使用ID
      const fileName = (iconLabels.get(box.id) || box.id) + '.svg';
      zip.file(fileName, result.svg);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
