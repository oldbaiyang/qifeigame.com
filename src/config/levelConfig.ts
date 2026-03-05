import type { LevelConfig } from '@/game/types'

// 关卡难度配置表
// 关卡层级 | 初始人数 | 进出批次 | 移动耗时 | 并发 | 重叠
// Lv.1-3  | 0-2     | 3-6次   | 1.5-2s  | 无   | 无
// Lv.4-7  | 0-5     | 7-12次  | 1.0-1.5s| 有   | 双人
// Lv.8+   | 0-12    | 15-20次 | 0.6-0.8s| 高频 | 3人+

export const levelConfigs: LevelConfig[] = [
  // Lv.1 - 入门
  {
    level: 1,
    initialCountRange: [0, 2],
    commandCountRange: [3, 4],
    moveDurationRange: [1800, 2000],
    maxConcurrency: 1,
    allowOverlap: false,
    overlapCount: 0
  },
  // Lv.2 - 简单
  {
    level: 2,
    initialCountRange: [0, 2],
    commandCountRange: [4, 5],
    moveDurationRange: [1600, 1800],
    maxConcurrency: 1,
    allowOverlap: false,
    overlapCount: 0
  },
  // Lv.3 - 基础
  {
    level: 3,
    initialCountRange: [0, 3],
    commandCountRange: [5, 6],
    moveDurationRange: [1500, 1700],
    maxConcurrency: 1,
    allowOverlap: false,
    overlapCount: 0
  },
  // Lv.4 - 进阶
  {
    level: 4,
    initialCountRange: [0, 4],
    commandCountRange: [7, 8],
    moveDurationRange: [1200, 1500],
    maxConcurrency: 2,
    allowOverlap: true,
    overlapCount: 2
  },
  // Lv.5 - 中等
  {
    level: 5,
    initialCountRange: [0, 5],
    commandCountRange: [8, 10],
    moveDurationRange: [1100, 1400],
    maxConcurrency: 2,
    allowOverlap: true,
    overlapCount: 2
  },
  // Lv.6 - 较难
  {
    level: 6,
    initialCountRange: [1, 5],
    commandCountRange: [9, 11],
    moveDurationRange: [1000, 1300],
    maxConcurrency: 2,
    allowOverlap: true,
    overlapCount: 2
  },
  // Lv.7 - 困难
  {
    level: 7,
    initialCountRange: [1, 6],
    commandCountRange: [10, 12],
    moveDurationRange: [900, 1200],
    maxConcurrency: 3,
    allowOverlap: true,
    overlapCount: 2
  },
  // Lv.8+ - 专家
  {
    level: 8,
    initialCountRange: [2, 8],
    commandCountRange: [12, 15],
    moveDurationRange: [700, 1000],
    maxConcurrency: 3,
    allowOverlap: true,
    overlapCount: 3
  },
  // Lv.9+ - 大师
  {
    level: 9,
    initialCountRange: [2, 10],
    commandCountRange: [14, 17],
    moveDurationRange: [650, 900],
    maxConcurrency: 4,
    allowOverlap: true,
    overlapCount: 3
  },
  // Lv.10+ - 极限
  {
    level: 10,
    initialCountRange: [3, 12],
    commandCountRange: [15, 20],
    moveDurationRange: [600, 800],
    maxConcurrency: 4,
    allowOverlap: true,
    overlapCount: 4
  }
]

// 获取关卡配置
export function getLevelConfig(level: number): LevelConfig {
  // 超过配置的最高关卡时，使用最高难度
  const index = Math.min(level - 1, levelConfigs.length - 1)
  return levelConfigs[index]
}

// 计算关卡分数
export function calculateScore(level: number, isCorrect: boolean): number {
  if (!isCorrect) return 0
  return level * 100 + Math.floor(level * 10) // 基础分 + 关卡加成
}

// 本地存储键名
export const STORAGE_KEYS = {
  HIGH_SCORE: 'brain_count_high_score',
  LAST_LEVEL: 'brain_count_last_level',
  LIVES: 'brain_count_lives'
}
