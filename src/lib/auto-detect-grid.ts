/**
 * 自动检测图标网格的行列数
 *
 * 实现原理：
 * 1. 将图片转换为灰度图
 * 2. 使用边缘检测（Sobel算子）找分隔线
 * 3. 使用霍夫变换检测水平线和垂直线
 * 4. 分析线之间的间距推断网格行列数
 */

interface GridDetectionResult {
  rows: number;
  cols: number;
  confidence: number; // 置信度 0-1
  detectedGridSize: string; // 例如 "5x5"
}

/**
 * 自动检测图片的网格布局
 * @param imageData 图片的 base64 数据
 * @returns 检测到的网格信息
 */
export async function autoDetectGrid(imageData: string): Promise<GridDetectionResult | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const result = detectGridFromImage(img);
        resolve(result);
      } catch (error) {
        console.error('自动检测网格失败:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.error('图片加载失败');
      resolve(null);
    };

    img.src = imageData;
  });
}

/**
 * 从图像中检测网格布局
 */
function detectGridFromImage(img: HTMLImageElement): GridDetectionResult | null {
  // 创建 canvas 进行图像处理
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 缩小图片以提高性能（最大 512px）
  const maxSize = 512;
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imageData;

  // 转换为灰度图
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // 检测水平分隔线（水平边缘检测）
  const horizontalLines = detectSeparationLines(gray, width, height, 'horizontal');

  // 检测垂直分隔线（垂直边缘检测）
  const verticalLines = detectSeparationLines(gray, width, height, 'vertical');

  console.log('🔍 检测到分隔线 - 水平:', horizontalLines.length, '垂直:', verticalLines.length);

  // 分析检测结果
  const result = analyzeDetectionResult(horizontalLines, verticalLines, width, height);

  return result;
}

/**
 * 检测分隔线（水平或垂直）
 * 使用投影分析法 + 智能筛选最佳网格数量
 */
function detectSeparationLines(
  gray: Uint8Array,
  width: number,
  height: number,
  direction: 'horizontal' | 'vertical'
): number[] {
  const isHorizontal = direction === 'horizontal';
  const projectionSize = isHorizontal ? height : width;

  // 计算每一行/列的平均亮度（投影）
  const projection = new Float32Array(projectionSize);

  if (isHorizontal) {
    // 水平方向：计算每一行的平均亮度
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x < width; x++) {
        sum += gray[y * width + x];
      }
      projection[y] = sum / width;
    }
  } else {
    // 垂直方向：计算每一列的平均亮度
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = 0; y < height; y++) {
        sum += gray[y * width + x];
      }
      projection[x] = sum / height;
    }
  }

  // 平滑投影
  const smoothed = smoothEdges(projection, projectionSize);

  // 寻找所有候选谷值（使用宽松的阈值）
  const allCandidates = findAllValleys(smoothed);

  console.log(`  📊 找到 ${allCandidates.length} 个候选谷值`);

  // 智能选择最佳数量的分隔线
  const bestLines = selectBestGridSize(allCandidates, projectionSize);

  console.log(`  ✅ 选择 ${bestLines.length} 条分隔线`);

  return bestLines;
}

/**
 * 平滑边缘强度
 */
function smoothEdges(edges: Float32Array, size: number): Float32Array {
  const smoothed = new Float32Array(size);
  // 减小平滑窗口，从 size/20 改为 size/30，避免过度平滑导致峰值合并
  const windowSize = Math.max(3, Math.floor(size / 30));

  for (let i = 0; i < size; i++) {
    let sum = 0;
    let count = 0;
    for (let j = -windowSize; j <= windowSize; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < size) {
        sum += edges[idx];
        count++;
      }
    }
    smoothed[i] = sum / count;
  }

  return smoothed;
}

/**
 * 寻找峰值（分隔线）- 边缘检测用
 */
function findPeaks(edges: Float32Array): number[] {
  const peaks: number[] = [];
  const threshold = calculateThreshold(edges);
  const minDistance = 5; // 最小峰值间距

  // 忽略边缘区域（前 5% 和后 5%），避免误识别图片边界为分隔线
  const edgeMargin = Math.floor(edges.length * 0.05);
  const searchStart = Math.max(minDistance, edgeMargin);
  const searchEnd = Math.min(edges.length - minDistance, edges.length - edgeMargin);

  let i = searchStart;
  while (i < searchEnd) {
    // 检查是否是局部最大值且超过阈值
    if (edges[i] > threshold) {
      let isPeak = true;
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && edges[j] >= edges[i]) {
          isPeak = false;
          break;
        }
      }

      if (isPeak) {
        peaks.push(i);
        i += minDistance; // 跳过这段区域
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  return peaks;
}

/**
 * 寻找所有候选谷值（暗线）
 * 使用非常宽松的阈值，找到所有可能的分隔线
 */
function findAllValleys(projection: Float32Array): number[] {
  const valleys: number[] = [];

  // 计算平均亮度和标准差
  const mean = projection.reduce((sum, val) => sum + val, 0) / projection.length;
  const variance = projection.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / projection.length;
  const stdDev = Math.sqrt(variance);

  // 调试输出
  console.log(`  📊 投影统计: 均值=${mean.toFixed(1)}, 标准差=${stdDev.toFixed(1)}`);
  console.log(`  📊 最小值=${Math.min(...projection).toFixed(1)}, 最大值=${Math.max(...projection).toFixed(1)}`);

  // 使用非常宽松的阈值（均值 - 0.1 * 标准差）
  const threshold = mean - stdDev * 0.1;
  console.log(`  📊 暗线阈值: < ${threshold.toFixed(1)}`);

  const minDistance = 3;
  const edgeMargin = Math.floor(projection.length * 0.03);
  const searchStart = Math.max(minDistance, edgeMargin);
  const searchEnd = Math.min(projection.length - minDistance, projection.length - edgeMargin);

  const windowSize = 5;
  for (let i = searchStart; i < searchEnd; i++) {
    if (projection[i] >= threshold) continue;

    // 检查是否是窗口内的最小值
    let isLocalMin = true;
    for (let j = Math.max(searchStart, i - windowSize); j <= Math.min(searchEnd - 1, i + windowSize); j++) {
      if (j !== i && projection[j] < projection[i]) {
        isLocalMin = false;
        break;
      }
    }

    if (isLocalMin) {
      if (valleys.length === 0 || i - valleys[valleys.length - 1] >= minDistance) {
        valleys.push(i);
      }
    }
  }

  return valleys;
}

/**
 * 智能选择最佳网格数量
 * 基于间距均匀性，从候选谷值中选择最佳数量
 */
function selectBestGridSize(candidates: number[], totalSize: number): number[] {
  if (candidates.length === 0) return [];

  // 始终进行均匀性评分，不再直接返回
  // 这样可以过滤掉多余的候选谷值

  // 计算每种可能的网格数量的均匀性得分
  // 尝试从 2 到 min(candidates, 8) 条分隔线
  let bestScore = -1;
  let bestCount = 0;

  for (let count = 2; count <= Math.min(candidates.length, 8); count++) {
    // 均匀选择 count 条分隔线
    const step = (candidates.length - 1) / (count - 1);
    const selected: number[] = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.round(i * step);
      selected.push(candidates[idx]);
    }

    // 计算间距的均匀性
    const score = calculateSpacingScore(selected, totalSize);

    console.log(`    尝试 ${count} 条分隔线: 均匀性得分=${score.toFixed(3)}`);

    if (score > bestScore) {
      bestScore = score;
      bestCount = count;
    }
  }

  console.log(`    ✅ 最佳: ${bestCount} 条分隔线 (得分=${bestScore.toFixed(3)})`);

  // 返回最佳数量的均匀分隔线
  const step = (candidates.length - 1) / (bestCount - 1);
  const selected: number[] = [];

  for (let i = 0; i < bestCount; i++) {
    const idx = Math.round(i * step);
    selected.push(candidates[idx]);
  }

  return selected;
}

/**
 * 计算间距均匀性得分
 */
function calculateSpacingScore(lines: number[], totalSize: number): number {
  if (lines.length < 2) return 0;

  // 计算间距
  const spacings: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    spacings.push(lines[i] - lines[i - 1]);
  }

  // 如果只有 1 个间距（2 条线），无法判断均匀性，返回低分
  if (spacings.length === 1) {
    return 0.3; // 惩罚得分，因为样本太少
  }

  // 计算变异系数（CV = 标准差 / 均值）
  const mean = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
  const variance = spacings.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / spacings.length;
  const stdDev = Math.sqrt(variance);

  const cv = stdDev / mean;

  // 转换为得分（CV 越小，得分越高）
  return Math.max(0, 1 - cv);
}

/**
 * 计算自适应阈值
 */
function calculateThreshold(edges: Float32Array): number {
  // 使用 Otsu 方法或简单的均值 + 标准差
  const mean = edges.reduce((sum, val) => sum + val, 0) / edges.length;
  const variance = edges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / edges.length;
  const stdDev = Math.sqrt(variance);

  // 使用更平衡的阈值 0.6，避免过高导致漏检
  return mean + stdDev * 0.6;
}

/**
 * 分析检测结果，推断网格行列数
 */
function analyzeDetectionResult(
  horizontalLines: number[],
  verticalLines: number[],
  imageWidth: number,
  imageHeight: number
): GridDetectionResult | null {
  // 从线条数量推断网格
  // 如果有 n 条分隔线，则将图片分成 n+1 个区域

  // 过滤：至少需要 2 条线才能形成 3 个区域
  if (horizontalLines.length < 2 || verticalLines.length < 2) {
    console.log('⚠️ 检测到的分隔线不足，无法推断网格');
    return null;
  }

  let rows = Math.min(horizontalLines.length + 1, 8); // 最多 8 行
  let cols = Math.min(verticalLines.length + 1, 8); // 最多 8 列

  // 如果图片接近正方形，强制网格为正方形
  const aspectRatio = imageWidth / imageHeight;
  const isSquareImage = aspectRatio > 0.9 && aspectRatio < 1.1;

  if (isSquareImage) {
    console.log(`📐 图片为正方形 (${imageWidth}×${imageHeight})，强制使用正方形网格`);

    // 分别计算水平和垂直方向的置信度
    const horizontalConfidence = calculateSingleDirectionConfidence(horizontalLines, imageHeight);
    const verticalConfidence = calculateSingleDirectionConfidence(verticalLines, imageWidth);

    console.log(`  📊 水平方向置信度: ${(horizontalConfidence * 100).toFixed(1)}% (${rows} 行)`);
    console.log(`  📊 垂直方向置信度: ${(verticalConfidence * 100).toFixed(1)}% (${cols} 列)`);

    // 选择置信度更高的方向作为网格大小
    const gridSize = horizontalConfidence >= verticalConfidence ? rows : cols;
    rows = gridSize;
    cols = gridSize;

    console.log(`  📐 选择置信度更高的方向: ${gridSize}×${gridSize}`);
  }

  // 过滤：网格太小或太大
  if (rows < 2 || cols < 2 || rows > 8 || cols > 8) {
    console.log('⚠️ 检测到的网格超出合理范围');
    return null;
  }

  // 计算置信度（基于线条的均匀性）
  const confidence = calculateConfidence(horizontalLines, verticalLines, imageWidth, imageHeight);

  console.log(`✅ 检测到网格: ${rows}×${cols}, 置信度: ${(confidence * 100).toFixed(1)}%`);

  return {
    rows,
    cols,
    confidence,
    detectedGridSize: `${rows}×${cols}`,
  };
}

/**
 * 计算单方向线条的置信度
 */
function calculateSingleDirectionConfidence(lines: number[], totalSize: number): number {
  if (lines.length < 2) return 0;

  // 计算间距
  const spacings: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    spacings.push(lines[i] - lines[i - 1]);
  }

  // 计算变异系数（CV = 标准差 / 均值）
  const mean = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
  const variance = spacings.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / spacings.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // 转换为 0-1 的置信度（CV 越小，置信度越高）
  return Math.max(0, 1 - cv);
}

/**
 * 计算检测置信度
 */
function calculateConfidence(
  horizontalLines: number[],
  verticalLines: number[],
  imageWidth: number,
  imageHeight: number
): number {
  const horizontalConfidence = calculateSingleDirectionConfidence(horizontalLines, imageHeight);
  const verticalConfidence = calculateSingleDirectionConfidence(verticalLines, imageWidth);

  // 综合置信度
  return (horizontalConfidence + verticalConfidence) / 2;
}
