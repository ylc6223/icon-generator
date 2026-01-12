import { BoundingBox, VectorizationResult, VectorizationPreset, VECTORIZATION_PRESETS } from '@/stores/workbench-store';
import { traceWithVTracer, initVTracer, isVTracerReady } from './vectorization/vtracer.wasm';
import { getWorkerPool } from '@/workers';

// 初始化 VTracer WASM（在模块加载时执行）
let vtracerInitialized = false;

async function ensureVTracerInitialized() {
  if (!vtracerInitialized) {
    try {
      await initVTracer();
      vtracerInitialized = true;
    } catch (error) {
      console.warn('VTracer WASM 初始化失败，将使用备用算法:', error);
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

      resolve(boxes);
    };
    img.src = imageData;
  });
}

/**
 * 将位图转换为SVG (使用VTracer WASM)
 * @param imageData 图标的base64数据
 * @param preset 矢量化预设
 * @returns SVG字符串
 */
export async function imageToSvg(
  imageData: string,
  preset: VectorizationPreset
): Promise<string> {
  // 确保 VTracer 已初始化
  await ensureVTracerInitialized();

  // 如果 VTracer 可用，使用它
  if (isVTracerReady()) {
    try {
      return await traceWithVTracer(imageData, preset);
    } catch (error) {
      console.warn('VTracer 矢量化失败，使用备用算法:', error);
      // 降级到备用算法
      return await imageToSvgFallback(imageData, preset);
    }
  }

  // 否则使用备用算法
  return await imageToSvgFallback(imageData, preset);
}

/**
 * 备用矢量化算法（当 VTracer 不可用时使用）
 * 使用简单的 potrace 算法
 */
async function imageToSvgFallback(
  imageData: string,
  preset: VectorizationPreset
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

      // 根据预设调整缩放
      const scaleFactor = preset.name === 'detailed' ? 2 : preset.name === 'clean' ? 1.5 : 1;
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;

      ctx.imageSmoothingEnabled = preset.name !== 'detailed';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 获取图像数据并生成SVG
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const svg = traceToSvg(imgData, preset);

      resolve(svg);
    };
    img.src = imageData;
  });
}

/**
 * 矢量化单个图标并返回完整结果
 * @param imageData 图标的base64数据
 * @param preset 矢量化预设
 * @returns 矢量化结果
 */
export async function vectorizeIcon(
  imageData: string,
  preset: VectorizationPreset
): Promise<VectorizationResult> {
  const svg = await imageToSvg(imageData, preset);

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
 * 批量矢量化图标 (使用WebWorker并发处理)
 * @param images 图标数组
 * @param preset 矢量化预设
 * @param onProgress 进度回调
 * @returns 矢量化结果数组
 */
export async function batchVectorize(
  images: string[],
  preset: VectorizationPreset,
  onProgress?: (current: number, total: number) => void
): Promise<VectorizationResult[]> {
  // 分块处理: 超过100个图标时分批处理
  const CHUNK_SIZE = 100;
  const chunks: string[][] = [];

  for (let i = 0; i < images.length; i += CHUNK_SIZE) {
    chunks.push(images.slice(i, i + CHUNK_SIZE));
  }

  const allResults: VectorizationResult[] = [];
  let completedCount = 0;

  // 获取WorkerPool实例
  const pool = getWorkerPool();

  // 逐块处理
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];

    // 为当前块创建任务
    const tasks = chunk.map((imageData, index) => ({
      id: `icon-${chunkIndex * CHUNK_SIZE + index}`,
      imageData,
      preset,
    }));

    // 使用WorkerPool并发执行任务
    const results = await pool.batchExecute(tasks, (current, total) => {
      const overallCompleted = completedCount + current;
      if (onProgress) {
        onProgress(overallCompleted, images.length);
      }
    });

    allResults.push(...results);
    completedCount += chunk.length;
  }

  return allResults;
}

/**
 * 简单的图像追踪转SVG（临时实现，将被VTracer WASM替代）
 */
function traceToSvg(
  imageData: ImageData,
  preset: VectorizationPreset
): string {
  const { width, height, data } = imageData;

  // 根据预设设置阈值
  const threshold = preset.name === 'clean' ? 200 : preset.name === 'detailed' ? 128 : 160;

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

  // 根据预设简化路径
  const simplifyFactor = preset.name === 'detailed' ? 0.5 : preset.name === 'clean' ? 2 : 1;
  const simplifiedPaths = paths.map(path => simplifyPath(path, simplifyFactor));

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
 * @param preset 矢量化预设
 * @returns ZIP文件Blob
 */
export async function exportIconsAsZip(
  boxes: BoundingBox[],
  vectorizedIcons: Map<string, VectorizationResult>,
  iconLabels: Map<string, string>,
  preset: VectorizationPreset
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const box of boxes) {
    // 获取已矢量化的SVG或生成新的
    let result = vectorizedIcons.get(box.id);

    if (!result && box.imageData) {
      result = await vectorizeIcon(box.imageData, preset);
    }

    if (result) {
      // 使用标签作为文件名，如果没有标签则使用ID
      const fileName = (iconLabels.get(box.id) || box.id) + '.svg';
      zip.file(fileName, result.svg);
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
