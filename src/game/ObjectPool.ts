import { Graphics, Container } from 'pixi.js'

/**
 * 小人精灵对象池
 * 预创建精灵对象，避免运行时GC
 */
export class ObjectPool {
  private pool: Graphics[] = []
  private activeSprites: Set<Graphics> = new Set()
  private container: Container

  // 小人绘制参数
  private readonly PERSON_WIDTH = 30
  private readonly PERSON_HEIGHT = 60
  private readonly PERSON_COLOR = 0x000000

  constructor(container: Container, poolSize: number = 50) {
    this.container = container
    this.initPool(poolSize)
  }

  /**
   * 初始化对象池
   */
  private initPool(size: number): void {
    for (let i = 0; i < size; i++) {
      const sprite = this.createPersonSprite()
      sprite.visible = false
      this.pool.push(sprite)
      this.container.addChild(sprite)
    }
  }

  /**
   * 创建小人精灵（极简黑色剪影）
   */
  private createPersonSprite(): Graphics {
    const g = new Graphics()

    // 头部（圆形）
    g.circle(this.PERSON_WIDTH / 2, 10, 10)
    g.fill({ color: this.PERSON_COLOR })

    // 身体（矩形）
    g.rect(5, 20, this.PERSON_WIDTH - 10, 22)
    g.fill({ color: this.PERSON_COLOR })

    // 腿部
    g.rect(7, 42, 6, 18)
    g.fill({ color: this.PERSON_COLOR })
    g.rect(this.PERSON_WIDTH - 13, 42, 6, 18)
    g.fill({ color: this.PERSON_COLOR })

    return g
  }

  /**
   * 获取一个小人精灵
   */
  acquire(): Graphics | null {
    // 从池中获取
    for (const sprite of this.pool) {
      if (!this.activeSprites.has(sprite)) {
        this.activeSprites.add(sprite)
        sprite.visible = true
        sprite.alpha = 1
        return sprite
      }
    }

    // 池中无可用对象，动态创建
    console.warn('[ObjectPool] Pool exhausted, creating new sprite')
    const sprite = this.createPersonSprite()
    this.pool.push(sprite)
    this.container.addChild(sprite)
    this.activeSprites.add(sprite)
    return sprite
  }

  /**
   * 归还一个小人精灵
   */
  release(sprite: Graphics): void {
    sprite.visible = false
    sprite.x = 0
    sprite.y = 0
    sprite.scale.set(1)
    this.activeSprites.delete(sprite)
  }

  /**
   * 释放所有活跃精灵
   */
  releaseAll(): void {
    for (const sprite of this.activeSprites) {
      sprite.visible = false
      sprite.x = 0
      sprite.y = 0
      sprite.scale.set(1)
    }
    this.activeSprites.clear()
  }

  /**
   * 获取池大小
   */
  get poolSize(): number {
    return this.pool.length
  }

  /**
   * 获取活跃数量
   */
  get activeCount(): number {
    return this.activeSprites.size
  }

  /**
   * 销毁对象池
   */
  destroy(): void {
    for (const sprite of this.pool) {
      sprite.destroy()
    }
    this.pool = []
    this.activeSprites.clear()
  }
}
