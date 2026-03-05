import { Howl, Howler } from 'howler'
import { SoundType } from '@/game/types'

/**
 * 音频管理器
 * 使用Howler.js管理游戏音效
 */
class AudioManager {
  private sounds: Map<SoundType, Howl> = new Map()
  private enabled: boolean = true
  private initialized: boolean = false

  /**
   * 初始化音频
   */
  async init(): Promise<void> {
    if (this.initialized) return

    // 创建合成音效（不依赖外部音频文件）
    this.createSyntheticSounds()
    this.initialized = true
    console.log('[AudioManager] Initialized with synthetic sounds')
  }

  /**
   * 创建合成音效（使用Web Audio API）
   */
  private createSyntheticSounds(): void {
    // 由于没有外部音频文件，我们使用简单的音效
    // 实际项目中应该加载音频精灵文件

    // 预留音频配置
    const audioConfig: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
      [SoundType.ENTER]: { freq: 440, duration: 0.1, type: 'sine' },
      [SoundType.EXIT]: { freq: 330, duration: 0.1, type: 'sine' },
      [SoundType.CORRECT]: { freq: 880, duration: 0.2, type: 'sine' },
      [SoundType.WRONG]: { freq: 220, duration: 0.3, type: 'square' },
      [SoundType.CLICK]: { freq: 600, duration: 0.05, type: 'sine' },
      [SoundType.GAME_OVER]: { freq: 165, duration: 0.5, type: 'sawtooth' },
      [SoundType.LEVEL_UP]: { freq: 660, duration: 0.3, type: 'sine' }
    }

    // 存储配置用于播放
    for (const [type, config] of Object.entries(audioConfig)) {
      this.sounds.set(type as SoundType, config as unknown as Howl)
    }
  }

  /**
   * 播放音效
   */
  play(type: SoundType): void {
    if (!this.enabled || !this.initialized) return

    const config = this.sounds.get(type) as unknown as { freq: number; duration: number; type: OscillatorType }
    if (!config) return

    try {
      this.playSyntheticSound(config.freq, config.duration, config.type)
    } catch (e) {
      console.warn('[AudioManager] Failed to play sound:', e)
    }
  }

  /**
   * 使用Web Audio API播放合成音效
   */
  private playSyntheticSound(freq: number, duration: number, type: OscillatorType): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    Howler.mute(!enabled)
  }

  /**
   * 获取启用状态
   */
  getEnabled(): boolean {
    return this.enabled
  }

  /**
   * 切换音效开关
   */
  toggle(): boolean {
    this.enabled = !this.enabled
    Howler.mute(!this.enabled)
    return this.enabled
  }
}

// 导出单例
export const audioManager = new AudioManager()
