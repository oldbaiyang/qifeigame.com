// 游戏状态枚举
export enum GameState {
  PREPARING = 'PREPARING',       // 准备阶段（显示初始人数）
  ANIMATING = 'ANIMATING',       // 动画进行中
  WAITING_INPUT = 'WAITING_INPUT', // 等待玩家输入
  SETTLING = 'SETTLING',         // 结算中
  GAME_OVER = 'GAME_OVER'        // 游戏结束
}

// 移动方向
export enum MoveDirection {
  ENTER = 'ENTER',  // 进入房屋
  EXIT = 'EXIT'     // 离开房屋
}

// 单个移动指令
export interface MoveCommand {
  direction: MoveDirection
  count: number      // 同时移动的人数（并发）
  delay: number      // 相对于上一条的延迟（ms）
  duration: number   // 移动耗时（ms）
}

// 关卡剧本
export interface LevelScript {
  initialCount: number       // 初始人数
  commands: MoveCommand[]    // 移动指令队列
  finalCount: number         // 最终人数（用于校验）
}

// 关卡配置
export interface LevelConfig {
  level: number
  initialCountRange: [number, number]  // 初始人数范围
  commandCountRange: [number, number]  // 指令条数范围
  moveDurationRange: [number, number]  // 移动耗时范围（ms）
  maxConcurrency: number               // 最大并发数
  allowOverlap: boolean                // 允许动画重叠
  overlapCount: number                 // 重叠人数
}

// 游戏数据
export interface GameData {
  currentLevel: number
  lives: number
  maxLives: number
  score: number
  highScore: number
  currentAnswer: string
}

// 音效类型
export enum SoundType {
  ENTER = 'enter',
  EXIT = 'exit',
  CORRECT = 'correct',
  WRONG = 'wrong',
  CLICK = 'click',
  GAME_OVER = 'gameOver',
  LEVEL_UP = 'levelUp'
}

// 小人精灵数据
export interface PersonSprite {
  id: number
  x: number
  y: number
  visible: boolean
  active: boolean
}
