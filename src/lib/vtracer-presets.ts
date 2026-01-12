/**
 * VTracer 预设配置
 * 不同的预设适合不同的使用场景
 */

export interface VTracerPresetConfig {
  name: string;
  displayName: string;
  description: string;
  filter_speckle: number;
  color_precision: number;
  layer_difference: number;
  corner_threshold: number;
  length_threshold: number;
  max_iterations: number;
  splice_threshold: number;
}

export const VTRACER_PRESETS: Record<string, VTracerPresetConfig> = {
  // Minimal 预设：最小文件大小，最少细节
  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    description: '最小文件，适合扁平化图标（4-6 色）',
    filter_speckle: 100,
    color_precision: 8,
    layer_difference: 32,
    corner_threshold: 60,
    length_threshold: 5.0,
    max_iterations: 10,
    splice_threshold: 45,
  },

  // Balanced 预设：平衡质量和大小
  balanced: {
    name: 'balanced',
    displayName: 'Balanced',
    description: '平衡模式，推荐大多数场景（8-12 色）',
    filter_speckle: 20,
    color_precision: 5,
    layer_difference: 16,
    corner_threshold: 30,
    length_threshold: 4.0,
    max_iterations: 15,
    splice_threshold: 30,
  },

  // Detailed 预设：保留细节（默认）
  detailed: {
    name: 'detailed',
    displayName: 'Detailed',
    description: '保留细节，适合复杂图标（12-18 色）',
    filter_speckle: 10,
    color_precision: 4,
    layer_difference: 10,
    corner_threshold: 25,
    length_threshold: 3.0,
    max_iterations: 20,
    splice_threshold: 25,
  },

  // Ultra 预设：保留几乎所有细节
  ultra: {
    name: 'ultra',
    displayName: 'Ultra',
    description: '极致细节，适合高质量需求（18-25 色，文件较大）',
    filter_speckle: 2,
    color_precision: 2,
    layer_difference: 6,
    corner_threshold: 15,
    length_threshold: 2.0,
    max_iterations: 30,
    splice_threshold: 15,
  },

  // Custom 预设：从环境变量读取
  custom: {
    name: 'custom',
    displayName: 'Custom',
    description: '使用 .env 文件中的自定义配置',
    filter_speckle: parseInt(import.meta.env.VITE_VTRACER_FILTER_SPECKLE || '5'),
    color_precision: parseInt(import.meta.env.VITE_VTRACER_COLOR_PRECISION || '3'),
    layer_difference: parseInt(import.meta.env.VITE_VTRACER_LAYER_DIFFERENCE || '8'),
    corner_threshold: parseInt(import.meta.env.VITE_VTRACER_CORNER_THRESHOLD || '20'),
    length_threshold: parseFloat(import.meta.env.VITE_VTRACER_LENGTH_THRESHOLD || '2.0'),
    max_iterations: parseInt(import.meta.env.VITE_VTRACER_MAX_ITERATIONS || '25'),
    splice_threshold: parseInt(import.meta.env.VITE_VTRACER_SPLICE_THRESHOLD || '20'),
  },
};

/**
 * 获取当前激活的预设
 * 优先级：环境变量 > 默认值（detailed）
 */
export function getActivePreset(): VTracerPresetConfig {
  const presetName = import.meta.env.VITE_VTRACER_PRESET || 'detailed';
  return VTRACER_PRESETS[presetName] || VTRACER_PRESETS.detailed;
}

/**
 * 获取所有可用的预设列表（用于 UI 选择）
 */
export function getAvailablePresets(): VTracerPresetConfig[] {
  return [
    VTRACER_PRESETS.minimal,
    VTRACER_PRESETS.balanced,
    VTRACER_PRESETS.detailed,
    VTRACER_PRESETS.ultra,
  ];
}
