import { MoveDirection, type LevelScript, type MoveCommand, type LevelConfig } from './types'

// 随机数生成器
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 关卡剧本生成器
 * 核心算法：预生成 + 模拟推演，确保人数不会为负
 */
export class ScriptGenerator {
  /**
   * 生成关卡剧本
   */
  static generate(config: LevelConfig): LevelScript {
    const initialCount = random(config.initialCountRange[0], config.initialCountRange[1])
    const commandCount = random(config.commandCountRange[0], config.commandCountRange[1])

    // 生成指令队列（带防负数校验）
    const commands = this.generateCommands(initialCount, commandCount, config)

    // 计算最终人数
    const finalCount = this.simulateFinalCount(initialCount, commands)

    return {
      initialCount,
      commands,
      finalCount
    }
  }

  /**
   * 生成指令队列
   * 使用模拟推演确保人数不会为负
   */
  private static generateCommands(
    initialCount: number,
    commandCount: number,
    config: LevelConfig
  ): MoveCommand[] {
    const commands: MoveCommand[] = []
    let currentCount = initialCount
    let lastEndTime = 0

    for (let i = 0; i < commandCount; i++) {
      const command = this.generateSingleCommand(
        currentCount,
        config,
        lastEndTime,
        i === commandCount - 1 // 最后一条指令
      )
      commands.push(command)

      // 更新当前人数
      if (command.direction === MoveDirection.ENTER) {
        currentCount += command.count
      } else {
        currentCount -= command.count
      }

      // 更新最后结束时间
      lastEndTime = command.delay + command.duration
    }

    return commands
  }

  /**
   * 生成单条指令
   */
  private static generateSingleCommand(
    currentCount: number,
    config: LevelConfig,
    lastEndTime: number,
    isLast: boolean
  ): MoveCommand {
    // 决定方向（进入或离开）
    // 如果当前人数为0，只能进入
    // 如果是最后一条且人数很少，倾向于进入（确保游戏有趣）
    let direction: MoveDirection

    if (currentCount === 0) {
      direction = MoveDirection.ENTER
    } else if (isLast && currentCount <= 2) {
      // 最后一条，70%概率进入
      direction = Math.random() < 0.7 ? MoveDirection.ENTER : MoveDirection.EXIT
    } else {
      direction = Math.random() < 0.5 ? MoveDirection.ENTER : MoveDirection.EXIT
    }

    // 决定并发人数
    let count = 1
    if (config.maxConcurrency > 1 && Math.random() < 0.4) {
      count = random(2, config.maxConcurrency)
    }

    // 如果是离开，确保不超过当前人数
    if (direction === MoveDirection.EXIT) {
      count = Math.min(count, currentCount)
      if (count === 0) {
        direction = MoveDirection.ENTER
        count = random(1, config.maxConcurrency)
      }
    }

    // 决定移动耗时
    const duration = random(config.moveDurationRange[0], config.moveDurationRange[1])

    // 决定延迟
    let delay: number
    if (config.allowOverlap && lastEndTime > 0 && Math.random() < 0.5) {
      // 允许重叠时，可能在上一条动画结束前开始
      const overlapTime = random(100, config.overlapCount * 200)
      delay = Math.max(0, lastEndTime - overlapTime)
    } else {
      // 不重叠，等待上一条完全结束
      delay = lastEndTime + random(100, 300)
    }

    return {
      direction,
      count,
      delay,
      duration
    }
  }

  /**
   * 模拟计算最终人数
   */
  private static simulateFinalCount(initialCount: number, commands: MoveCommand[]): number {
    let count = initialCount
    for (const cmd of commands) {
      if (cmd.direction === MoveDirection.ENTER) {
        count += cmd.count
      } else {
        count -= cmd.count
      }
    }
    return Math.max(0, count)
  }

  /**
   * 验证剧本有效性（用于调试）
   */
  static validate(script: LevelScript): boolean {
    let count = script.initialCount
    for (const cmd of script.commands) {
      if (cmd.direction === MoveDirection.ENTER) {
        count += cmd.count
      } else {
        count -= cmd.count
        if (count < 0) {
          console.error('Invalid script: negative count detected')
          return false
        }
      }
    }
    return count === script.finalCount
  }
}
