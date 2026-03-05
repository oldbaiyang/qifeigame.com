import { GameState, type GameData } from './types'

// Re-export GameState for convenience
export { GameState }
import { STORAGE_KEYS } from '@/config/levelConfig'

/**
 * 游戏状态机
 * 管理游戏状态流转和数据
 */
export class StateMachine {
  private _state: GameState = GameState.PREPARING
  private _data: GameData
  private listeners: Set<(state: GameState, data: GameData) => void> = new Set()

  constructor() {
    this._data = this.loadGameData()
  }

  /**
   * 获取当前状态
   */
  get state(): GameState {
    return this._state
  }

  /**
   * 获取游戏数据
   */
  get data(): GameData {
    return { ...this._data }
  }

  /**
   * 切换状态
   */
  setState(newState: GameState): void {
    const oldState = this._state
    this._state = newState
    this.notifyListeners()
    console.log(`[StateMachine] State changed: ${oldState} -> ${newState}`)
  }

  /**
   * 检查是否可以输入
   */
  get canInput(): boolean {
    return this._state === GameState.WAITING_INPUT
  }

  /**
   * 检查是否正在动画
   */
  get isAnimating(): boolean {
    return this._state === GameState.ANIMATING
  }

  /**
   * 更新分数
   */
  updateScore(score: number): void {
    this._data.score = score
    if (score > this._data.highScore) {
      this._data.highScore = score
      this.saveHighScore(score)
    }
    this.notifyListeners()
  }

  /**
   * 增加关卡
   */
  nextLevel(): void {
    this._data.currentLevel++
    this.saveLastLevel(this._data.currentLevel)
    this.notifyListeners()
  }

  /**
   * 重置关卡
   */
  resetLevel(): void {
    this._data.currentLevel = 1
    this._data.lives = this._data.maxLives
    this._data.score = 0
    this._data.currentAnswer = ''
    this.saveLastLevel(1)
    this.saveLives(this._data.maxLives) // 重置时也保存生命值
    this.notifyListeners()
  }

  /**
   * 扣除生命值
   */
  loseLife(): boolean {
    this._data.lives--
    this.saveLives(this._data.lives) // 保存生命值
    this.notifyListeners()

    if (this._data.lives <= 0) {
      this.setState(GameState.GAME_OVER)
      return false
    }
    return true
  }

  /**
   * 设置当前答案
   */
  setAnswer(answer: string): void {
    this._data.currentAnswer = answer
    this.notifyListeners()
  }

  /**
   * 清空答案
   */
  clearAnswer(): void {
    this._data.currentAnswer = ''
    this.notifyListeners()
  }

  /**
   * 添加状态监听器
   */
  addListener(callback: (state: GameState, data: GameData) => void): void {
    this.listeners.add(callback)
  }

  /**
   * 移除状态监听器
   */
  removeListener(callback: (state: GameState, data: GameData) => void): void {
    this.listeners.delete(callback)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this._state, this.data)
    }
  }

  /**
   * 加载游戏数据
   */
  private loadGameData(): GameData {
    const highScore = parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10)
    const lastLevel = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_LEVEL) || '1', 10)
    const savedLives = parseInt(localStorage.getItem(STORAGE_KEYS.LIVES) || '3', 10)

    return {
      currentLevel: lastLevel,
      lives: savedLives,
      maxLives: 3,
      score: 0,
      highScore,
      currentAnswer: ''
    }
  }

  /**
   * 保存最高分
   */
  private saveHighScore(score: number): void {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString())
  }

  /**
   * 保存最后关卡
   */
  private saveLastLevel(level: number): void {
    localStorage.setItem(STORAGE_KEYS.LAST_LEVEL, level.toString())
  }

  /**
   * 保存生命值
   */
  private saveLives(lives: number): void {
    localStorage.setItem(STORAGE_KEYS.LIVES, lives.toString())
  }
}
