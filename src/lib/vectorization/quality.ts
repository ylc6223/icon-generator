import { VectorizationResult } from '@/stores/workbench-store';

/**
 * 质量问题接口
 */
export interface QualityIssue {
  severity: 'warning' | 'error';
  message: string;
  suggestion: string;
}

/**
 * 质量检测结果
 */
export interface QualityCheckResult {
  hasIssues: boolean;
  issues: QualityIssue[];
  score: number; // 0-100，越高越好
}

/**
 * 质量检测器
 * 检测矢量化结果的质量问题
 */
export class QualityChecker {
  /**
   * 检查 SVG 质量
   * @param svg SVG 字符串
   * @param imageSize 图像文件大小（字节）
   * @returns 质量检测结果
   */
  static check(svg: string, imageSize: number): QualityCheckResult {
    const issues: QualityIssue[] = [];
    let score = 100;

    // 1. 检查路径复杂度
    const pathCount = (svg.match(/<path/g) || []).length;
    if (pathCount > 500) {
      issues.push({
        severity: 'warning',
        message: '路径复杂度过高',
        suggestion: '尝试使用"clean"预设简化路径，或减少颜色数量',
      });
      score -= 20;
    } else if (pathCount > 200) {
      issues.push({
        severity: 'warning',
        message: '路径数量较多',
        suggestion: '可能影响渲染性能，建议简化',
      });
      score -= 10;
    }

    // 2. 检查文件大小
    if (imageSize > 50 * 1024) {
      issues.push({
        severity: 'warning',
        message: `SVG 文件较大 (${(imageSize / 1024).toFixed(1)}KB)`,
        suggestion: '考虑使用"clean"预设减小文件大小',
      });
      score -= 15;
    } else if (imageSize > 20 * 1024) {
      issues.push({
        severity: 'warning',
        message: `SVG 文件偏大 (${(imageSize / 1024).toFixed(1)}KB)`,
        suggestion: '可能影响加载速度',
      });
      score -= 5;
    }

    // 3. 检查路径数量
    if (pathCount === 0) {
      issues.push({
        severity: 'error',
        message: '未检测到任何路径',
        suggestion: '图像可能完全透明或空白，请检查源图像',
      });
      score = 0;
    } else if (pathCount === 1) {
      issues.push({
        severity: 'warning',
        message: '只有一条路径',
        suggestion: '可能是简单的图标，如果效果满意可以忽略此警告',
      });
      score -= 5;
    }

    // 4. 检查 SVG 有效性
    if (!svg.includes('<svg') || !svg.includes('</svg>')) {
      issues.push({
        severity: 'error',
        message: '无效的 SVG 格式',
        suggestion: '矢量化过程可能出错，请重试',
      });
      score = 0;
    }

    // 5. 检查颜色数量（粗略估计）
    const fillMatches = svg.match(/fill="[^"]+"/g) || [];
    const strokeMatches = svg.match(/stroke="[^"]+"/g) || [];
    const colorCount = new Set([
      ...fillMatches.map(m => m.match(/fill="([^"]+)"/)?.[1]),
      ...strokeMatches.map(m => m.match(/stroke="([^"]+)"/)?.[1]),
    ]).size;

    if (colorCount > 10) {
      issues.push({
        severity: 'warning',
        message: `颜色数量较多 (${colorCount}种)`,
        suggestion: '考虑减少颜色数量以简化SVG',
      });
      score -= 10;
    }

    // 6. 检查是否有 viewBox
    if (!svg.includes('viewBox')) {
      issues.push({
        severity: 'warning',
        message: '缺少 viewBox 属性',
        suggestion: '可能影响响应式缩放',
      });
      score -= 5;
    }

    // 确保分数在 0-100 范围内
    score = Math.max(0, Math.min(100, score));

    return {
      hasIssues: issues.length > 0,
      issues,
      score,
    };
  }

  /**
   * 计算路径复杂度（基于节点数量）
   * @param svg SVG 字符串
   * @returns 节点数量
   */
  static calculateComplexity(svg: string): number {
    // 计算所有路径命令的节点数
    const pathMatches = svg.match(/<path[^>]*d="([^"]+)"/g) || [];
    let totalNodes = 0;

    for (const match of pathMatches) {
      const d = match.match(/d="([^"]+)"/)?.[1] || '';
      // 计算 M, L, C, Q, Z 等命令的数量
      const commands = d.match(/[MLCQZ]/g) || [];
      totalNodes += commands.length;
    }

    return totalNodes;
  }

  /**
   * 估算 SVG 文件大小（不生成实际文件）
   * @param svg SVG 字符串
   * @returns 文件大小（字节）
   */
  static estimateFilesize(svg: string): number {
    // 使用 Blob 获取实际大小
    return new Blob([svg]).size;
  }

  /**
   * 检查颜色使用情况
   * @param svg SVG 字符串
   * @returns 颜色统计信息
   */
  static analyzeColors(svg: string): {
    fillColors: string[];
    strokeColors: string[];
    totalColors: number;
  } {
    const fillMatches = svg.match(/fill="([^"]+)"/g) || [];
    const strokeMatches = svg.match(/stroke="([^"]+)"/g) || [];

    const fillColors = [...new Set(fillMatches.map(m => m.match(/fill="([^"]+)"/)?.[1] || ''))];
    const strokeColors = [...new Set(strokeMatches.map(m => m.match(/stroke="([^"]+)"/)?.[1] || ''))];

    return {
      fillColors,
      strokeColors,
      totalColors: new Set([...fillColors, ...strokeColors]).size,
    };
  }

  /**
   * 检查 SVG 的常见问题
   * @param svg SVG 字符串
   * @returns 问题列表
   */
  static checkCommonIssues(svg: string): string[] {
    const issues: string[] = [];

    // 检查是否有 xmlns
    if (!svg.includes('xmlns=') || !svg.includes('http://www.w3.org/2000/svg')) {
      issues.push('缺少正确的 xmlns 命名空间');
    }

    // 检查是否有 id 冲突
    const idMatches = svg.match(/id="[^"]+"/g) || [];
    const ids = new Set(idMatches.map(m => m.match(/id="([^"]+)"/)?.[1]));
    if (ids.size !== idMatches.length) {
      issues.push('存在重复的 id 属性');
    }

    // 检查是否有空的路径
    if (svg.includes('d=""')) {
      issues.push('存在空的路径数据');
    }

    return issues;
  }
}

/**
 * 快速质量检查（用于 UI 显示）
 * @param result 矢量化结果
 * @returns 质量等级（good, fair, poor）
 */
export function getQualityLevel(result: VectorizationResult): 'good' | 'fair' | 'poor' {
  const { pathCount, fileSize, warnings } = result;

  if (warnings.some(w => w.includes('未检测到任何路径'))) {
    return 'poor';
  }

  if (
    pathCount > 500 ||
    fileSize > 50 * 1024 ||
    warnings.length > 2
  ) {
    return 'poor';
  }

  if (
    pathCount > 200 ||
    fileSize > 20 * 1024 ||
    warnings.length > 0
  ) {
    return 'fair';
  }

  return 'good';
}
