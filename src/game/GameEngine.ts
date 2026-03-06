import { Application, Container, Graphics } from 'pixi.js'
import gsap from 'gsap'
import { ObjectPool } from './ObjectPool'
import { ScriptGenerator } from './ScriptGenerator'
import { StateMachine, GameState } from './StateMachine'
import { MoveDirection, type LevelScript, type MoveCommand } from './types'
import { getLevelConfig } from '@/config/levelConfig'

// 动画小人数据
interface AnimatingPerson {
  sprite: Graphics
  timeline: gsap.core.Timeline
  commandIndex: number
}

/**
 * 游戏引擎
 * 封装PixiJS，管理游戏渲染和动画
 *
 * 游戏流程：
 * 1. 显示初始人物（随机数量）
 * 2. 房子从天而降，盖住人物
 * 3. 人物从左侧进入房子，或从房子出来走向右侧
 * 4. 10秒后结束，玩家输入答案
 */
export class GameEngine {
  private app: Application | null = null
  private container: HTMLElement | null = null
  private objectPool: ObjectPool | null = null
  private stateMachine: StateMachine

  // 游戏元素
  private gameContainer!: Container
  private house!: Graphics
  private personContainer!: Container
  private initialPersonContainer!: Container

  // 当前关卡数据
  private currentScript: LevelScript | null = null
  private animatingPersons: AnimatingPerson[] = []
  private masterTimeline: gsap.core.Timeline | null = null

  // 布局参数
  private readonly HOUSE_WIDTH = 200
  private readonly HOUSE_HEIGHT = 160
  private readonly PERSON_WIDTH = 30

  // 回调
  private onAnimationComplete?: () => void

  constructor(stateMachine: StateMachine) {
    this.stateMachine = stateMachine
  }

  /**
   * 初始化引擎
   */
  async init(container: HTMLElement): Promise<void> {
    this.container = container

    // 等待容器有尺寸
    await new Promise(resolve => requestAnimationFrame(resolve))

    const width = container.clientWidth || 300
    const height = container.clientHeight || 400

    // 创建PixiJS应用 - 淡蓝灰背景
    this.app = new Application()
    await this.app.init({
      width,
      height,
      background: 0xe8eef5,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    container.appendChild(this.app.canvas)

    // 创建游戏容器
    this.gameContainer = new Container()
    this.app.stage.addChild(this.gameContainer)

    // 创建初始人物容器（用于显示初始人数）
    this.initialPersonContainer = new Container()
    this.gameContainer.addChild(this.initialPersonContainer)

    // 创建小人容器（在房屋下层，这样房屋会遮挡进入的人物）
    this.personContainer = new Container()
    this.gameContainer.addChild(this.personContainer)

    // 创建房屋（黑色剪影）- 在人物容器上层
    this.createHouse()
    this.house.visible = false // 初始隐藏

    // 创建对象池
    this.objectPool = new ObjectPool(this.personContainer, 50)

    // 居中布局
    this.resize()
    window.addEventListener('resize', this.resize.bind(this))

    console.log('[GameEngine] Initialized with size:', width, 'x', height)
  }

  /**
   * 创建房屋精灵 - 黑色剪影风格
   */
  private createHouse(): void {
    this.house = new Graphics()

    const houseX = -this.HOUSE_WIDTH / 2
    const houseY = -this.HOUSE_HEIGHT / 2

    // 屋顶（三角形）
    this.house.moveTo(houseX - 15, houseY)
    this.house.lineTo(0, houseY - 50)
    this.house.lineTo(houseX + this.HOUSE_WIDTH + 15, houseY)
    this.house.closePath()
    this.house.fill({ color: 0x000000 })

    // 房屋主体（黑色矩形）
    this.house.rect(houseX, houseY, this.HOUSE_WIDTH, this.HOUSE_HEIGHT)
    this.house.fill({ color: 0x000000 })

    // 门（深灰色，表示入口）
    const doorWidth = 35
    const doorHeight = 55
    this.house.rect(-doorWidth / 2, this.HOUSE_HEIGHT / 2 - doorHeight, doorWidth, doorHeight)
    this.house.fill({ color: 0x555555 })

    // 窗户（白色，4格窗户）
    const windowSize = 25
    const windowGap = 3
    const windowY = houseY + 30

    // 左窗（2x2格子）
    const leftWindowX = houseX + 25
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const wx = leftWindowX + col * (windowSize / 2 + windowGap)
        const wy = windowY + row * (windowSize / 2 + windowGap)
        this.house.rect(wx, wy, windowSize / 2, windowSize / 2)
        this.house.fill({ color: 0xffffff })
      }
    }

    // 右窗（2x2格子）
    const rightWindowX = houseX + this.HOUSE_WIDTH - 25 - windowSize
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const wx = rightWindowX + col * (windowSize / 2 + windowGap)
        const wy = windowY + row * (windowSize / 2 + windowGap)
        this.house.rect(wx, wy, windowSize / 2, windowSize / 2)
        this.house.fill({ color: 0xffffff })
      }
    }

    this.gameContainer.addChild(this.house)
  }

  /**
   * 创建单个小人剪影
   */
  private createPersonSprite(x: number, y: number): Graphics {
    const g = new Graphics()

    // 头部（圆形）
    g.circle(x + this.PERSON_WIDTH / 2, y + 10, 10)
    g.fill({ color: 0x000000 })

    // 身体（矩形）
    g.rect(x + 5, y + 20, this.PERSON_WIDTH - 10, 22)
    g.fill({ color: 0x000000 })

    // 腿部
    g.rect(x + 7, y + 42, 6, 18)
    g.fill({ color: 0x000000 })
    g.rect(x + this.PERSON_WIDTH - 13, y + 42, 6, 18)
    g.fill({ color: 0x000000 })

    return g
  }

  /**
   * 显示初始人物（随机位置散布）
   */
  private showInitialPeople(count: number): void {
    // 清空之前的
    this.initialPersonContainer.removeChildren()

    if (count === 0) return

    const spacing = 35
    const totalWidth = Math.min(count, 8) * spacing
    const startX = -totalWidth / 2 + spacing / 2
    const y = 0

    for (let i = 0; i < count; i++) {
      const col = i % 8
      const row = Math.floor(i / 8)
      const person = this.createPersonSprite(
        startX + col * spacing - this.PERSON_WIDTH / 2,
        y + row * 40 - 20
      )
      this.initialPersonContainer.addChild(person)
    }
  }

  /**
   * 房子从天而降动画
   */
  private dropHouse(): Promise<void> {
    return new Promise((resolve) => {
      this.house.visible = true
      this.house.y = -300 // 从上方开始

      gsap.to(this.house, {
        y: 0,
        duration: 0.8,
        ease: 'bounce.out',
        onComplete: () => {
          // 房子落下后，隐藏初始人物
          this.initialPersonContainer.visible = false
          resolve()
        }
      })
    })
  }

  /**
   * 调整布局
   */
  private resize(): void {
    if (!this.app || !this.container) return

    const width = this.container.clientWidth
    const height = this.container.clientHeight

    // 更新画布尺寸
    this.app.renderer.resize(width, height)

    // 居中游戏容器
    this.gameContainer.x = width / 2
    this.gameContainer.y = height / 2

    console.log('[GameEngine] Resized to:', width, 'x', height)
  }

  /**
   * 开始新关卡
   */
  startLevel(onComplete: () => void): void {
    this.onAnimationComplete = onComplete

    // 获取关卡配置
    const level = this.stateMachine.data.currentLevel
    const config = getLevelConfig(level)

    // 生成剧本
    this.currentScript = ScriptGenerator.generate(config)

    console.log('[GameEngine] Level script:', this.currentScript)

    // 清理之前的动画
    this.cleanup()

    // 重置房子位置
    this.house.y = 0
    this.house.visible = false
    this.initialPersonContainer.visible = true

    // 步骤1: 显示初始人物（2秒）
    this.stateMachine.setState(GameState.PREPARING)
    this.showInitialPeople(this.currentScript.initialCount)

    setTimeout(async () => {
      // 步骤2: 房子从天而降（0.8秒）
      await this.dropHouse()

      // 步骤3: 开始人物进出动画（10秒）
      this.startAnimation()
    }, 2000)
  }

  /**
   * 开始动画（人物进出，完成后立即结束）
   */
  private startAnimation(): void {
    if (!this.currentScript) return

    this.stateMachine.setState(GameState.ANIMATING)

    // 创建主时间线（不设置 onComplete，由 checkAllAnimationsComplete 处理）
    this.masterTimeline = gsap.timeline()

    // 在合理时间内随机分布所有进出动作
    let currentTime = 0

    for (const cmd of this.currentScript.commands) {
      // 随机延迟0.3-1秒后执行下一个动作
      const delay = 0.3 + Math.random() * 0.7
      currentTime += delay

      this.masterTimeline.call(() => {
        this.executeCommand(cmd)
      }, [], currentTime)
    }

    // 时间线长度由最后一个动画决定，不强制10秒
    console.log('[GameEngine] Animation timeline duration:', currentTime + 2, 'seconds')
  }

  /**
   * 执行单条指令
   */
  private executeCommand(cmd: MoveCommand): void {
    if (!this.objectPool || !this.currentScript) return

    for (let i = 0; i < cmd.count; i++) {
      const sprite = this.objectPool.acquire()
      if (!sprite) continue

      const offsetY = (i - (cmd.count - 1) / 2) * 25

      if (cmd.direction === MoveDirection.ENTER) {
        // 进入：从左侧走到房子门口，进入
        sprite.x = -this.HOUSE_WIDTH / 2 - 150
        sprite.y = offsetY
        sprite.alpha = 1
        this.animatePersonEnter(sprite, cmd.duration)
      } else {
        // 离开：从房子门口出现，走到右侧消失
        sprite.x = 0 - this.PERSON_WIDTH / 2 // 从门的位置开始
        sprite.y = offsetY
        sprite.alpha = 0
        this.animatePersonExit(sprite, cmd.duration)
      }
    }
  }

  /**
   * 人物进入动画（从左边进入房屋）
   */
  private animatePersonEnter(sprite: Graphics, duration: number): void {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.objectPool?.release(sprite)
        const idx = this.animatingPersons.findIndex(p => p.sprite === sprite)
        if (idx !== -1) this.animatingPersons.splice(idx, 1)

        // 检查是否所有动画都完成了
        this.checkAllAnimationsComplete()
      }
    })

    const doorCenterX = 0 // 门在房子中央

    // 移动到门的位置（进入房屋）
    timeline.to(sprite, {
      x: doorCenterX - this.PERSON_WIDTH / 2,
      duration: duration / 1000 * 0.8,
      ease: 'none'
    })

    // 淡出消失（完全进入房屋内部）
    timeline.to(sprite, {
      alpha: 0,
      duration: duration / 1000 * 0.2,
      ease: 'power2.in'
    })

    this.animatingPersons.push({ sprite, timeline, commandIndex: 0 })
  }

  /**
   * 人物离开动画（从房屋出来走向右侧）
   */
  private animatePersonExit(sprite: Graphics, duration: number): void {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.objectPool?.release(sprite)
        const idx = this.animatingPersons.findIndex(p => p.sprite === sprite)
        if (idx !== -1) this.animatingPersons.splice(idx, 1)

        // 检查是否所有动画都完成了
        this.checkAllAnimationsComplete()
      }
    })

    const rightEdge = this.HOUSE_WIDTH / 2 + 150

    // 从门的位置淡入出现
    timeline.to(sprite, {
      alpha: 1,
      duration: duration / 1000 * 0.15,
      ease: 'power2.out'
    })

    // 移动到右边消失
    timeline.to(sprite, {
      x: rightEdge,
      duration: duration / 1000 * 0.85,
      ease: 'none'
    })

    this.animatingPersons.push({ sprite, timeline, commandIndex: 0 })
  }

  /**
   * 检查所有动画是否完成
   */
  private checkAllAnimationsComplete(): void {
    // 如果没有正在进行的动画，且主时间线已完成，则触发完成回调
    if (this.animatingPersons.length === 0 && this.masterTimeline && !this.masterTimeline.isActive()) {
      console.log('[GameEngine] All animations complete')
      this.onAnimationComplete?.()
      this.onAnimationComplete = undefined // 防止重复调用
    }
  }

  /**
   * 获取当前正确答案
   */
  getCorrectAnswer(): number {
    return this.currentScript?.finalCount ?? 0
  }

  /**
   * 清理动画
   */
  private cleanup(): void {
    // 停止所有动画
    this.masterTimeline?.kill()
    this.masterTimeline = null

    // 回收所有精灵
    for (const person of this.animatingPersons) {
      person.timeline.kill()
      this.objectPool?.release(person.sprite)
    }
    this.animatingPersons = []

    // 清空初始人物
    this.initialPersonContainer.removeChildren()
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.cleanup()
    this.currentScript = null
    this.house.visible = false
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    this.cleanup()
    this.objectPool?.destroy()
    this.app?.destroy(true)
    window.removeEventListener('resize', this.resize.bind(this))
  }
}
