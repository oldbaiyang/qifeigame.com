<template>
  <div id="app">
    <!-- 顶部状态栏 -->
    <StatusBar
      :level="gameData.currentLevel"
      :lives="gameData.lives"
      :max-lives="gameData.maxLives"
      :score="gameData.score"
    />

    <!-- 游戏画布容器 -->
    <div ref="canvasContainer" class="game-canvas-container">
      <!-- 提示文字 -->
      <div v-if="hintText" class="hint-text">
        {{ hintText }}
      </div>
    </div>

    <!-- 九宫格键盘 -->
    <NumericKeypad
      ref="keypadRef"
      :enabled="canInput"
      @input="handleInput"
      @confirm="handleConfirm"
      @restart="showConfirmRestart = true"
    />

    <!-- 结果弹窗 -->
    <ResultModal
      :visible="showResultModal"
      :is-correct="isCorrect"
      :is-game-over="isGameOver"
      :correct-answer="correctAnswer"
      :earned-score="earnedScore"
      :final-score="gameData.score"
      :high-score="gameData.highScore"
      @next="handleNextLevel"
      @restart="handleRestart"
      @share="handleShare"
    />

    <!-- 确认重新开始弹窗 -->
    <ConfirmModal
      :visible="showConfirmRestart"
      @confirm="handleConfirmRestart"
      @cancel="showConfirmRestart = false"
    />

    <!-- 海报预览 -->
    <PosterPreview
      :visible="showPosterPreview"
      :poster-url="posterUrl"
      @close="showPosterPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StatusBar from './components/StatusBar.vue'
import NumericKeypad from './components/NumericKeypad.vue'
import ResultModal from './components/ResultModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import PosterPreview from './components/PosterPreview.vue'
import { GameEngine } from './game/GameEngine'
import { StateMachine, GameState } from './game/StateMachine'
import { calculateScore } from './config/levelConfig'
import { audioManager } from './utils/audioManager'
import { generatePoster, formatDate } from './utils/posterGenerator'
import { SoundType } from './game/types'

// 引用
const canvasContainer = ref<HTMLElement | null>(null)
const keypadRef = ref<InstanceType<typeof NumericKeypad> | null>(null)

// 游戏核心
let gameEngine: GameEngine | null = null
const stateMachine = new StateMachine()

// 响应式数据
const gameData = ref(stateMachine.data)
const hintText = ref('')
const currentState = ref(stateMachine.state)
const canInput = computed(() => currentState.value === GameState.WAITING_INPUT)

// 弹窗状态
const showResultModal = ref(false)
const showConfirmRestart = ref(false)
const isCorrect = ref(false)
const isGameOver = ref(false)
const correctAnswer = ref(0)
const earnedScore = ref(0)

// 海报相关
const showPosterPreview = ref(false)
const posterUrl = ref('')

// 更新游戏数据的函数
const updateGameData = () => {
  gameData.value = stateMachine.data
}

// 初始化游戏
const initGame = async () => {
  if (!canvasContainer.value) return

  // 初始化音频
  await audioManager.init()

  // 创建游戏引擎
  gameEngine = new GameEngine(stateMachine)
  await gameEngine.init(canvasContainer.value)

  // 监听状态变化
  stateMachine.addListener((state) => {
    currentState.value = state
    updateGameData()

    console.log('[App] State changed to:', state, 'canInput:', state === GameState.WAITING_INPUT)

    switch (state) {
      case GameState.PREPARING:
        hintText.value = '请记住人数'
        break
      case GameState.ANIMATING:
        hintText.value = '观察人物进出'
        break
      case GameState.WAITING_INPUT:
        hintText.value = '房屋里有几人？'
        break
      case GameState.SETTLING:
        hintText.value = ''
        break
    }
  })

  // 开始第一关
  startLevel()
}

// 开始关卡
const startLevel = () => {
  showResultModal.value = false
  keypadRef.value?.clear()
  stateMachine.clearAnswer()
  stateMachine.setState(GameState.PREPARING)

  gameEngine?.startLevel(() => {
    // 动画完成，等待输入
    stateMachine.setState(GameState.WAITING_INPUT)
  })
}

// 处理输入
const handleInput = (value: string) => {
  audioManager.play(SoundType.CLICK)
  stateMachine.setAnswer(value)
}

// 处理确认
const handleConfirm = (value: string) => {
  console.log('[App] handleConfirm called, value:', value, 'currentState:', currentState.value)

  if (currentState.value !== GameState.WAITING_INPUT) {
    console.log('[App] Not in WAITING_INPUT state, ignoring')
    return
  }

  const answer = parseInt(value, 10)
  correctAnswer.value = gameEngine?.getCorrectAnswer() ?? 0
  isCorrect.value = answer === correctAnswer.value

  console.log('[App] Answer:', answer, 'Correct:', correctAnswer.value, 'isCorrect:', isCorrect.value)

  // 计算得分
  earnedScore.value = calculateScore(gameData.value.currentLevel, isCorrect.value)

  if (isCorrect.value) {
    // 正确 - 加分并进入下一关
    audioManager.play(SoundType.CORRECT)
    stateMachine.updateScore(gameData.value.score + earnedScore.value)
    stateMachine.nextLevel() // 只有正确时才增加关卡
  } else {
    // 错误 - 扣生命值，关卡不变
    audioManager.play(SoundType.WRONG)
    const stillAlive = stateMachine.loseLife()
    isGameOver.value = !stillAlive

    if (isGameOver.value) {
      audioManager.play(SoundType.GAME_OVER)
    }
    // 注意：错误时不调用 nextLevel()，保持当前关卡
  }

  // 显示结果弹窗
  stateMachine.setState(GameState.SETTLING)
  showResultModal.value = true
}

// 下一关
const handleNextLevel = () => {
  startLevel()
}

// 重新开始
const handleRestart = () => {
  stateMachine.resetLevel()
  updateGameData()
  startLevel()
}

// 确认重新开始
const handleConfirmRestart = () => {
  showConfirmRestart.value = false
  handleRestart()
}

// 分享成绩
const handleShare = async () => {
  try {
    const url = await generatePoster({
      score: gameData.value.score,
      level: gameData.value.currentLevel,
      highScore: gameData.value.highScore,
      date: formatDate()
    })
    posterUrl.value = url
    showPosterPreview.value = true
  } catch (e) {
    console.error('Failed to generate poster:', e)
  }
}

// 生命周期
onMounted(() => {
  initGame()
})

onUnmounted(() => {
  gameEngine?.destroy()
})
</script>

<style>
@import './styles/main.css';
</style>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-canvas-container {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #e8eef5;
  min-height: 250px;
}

.hint-text {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: bold;
  color: #000000;
  text-align: center;
  pointer-events: none;
  z-index: 10;
  animation: fadeIn 0.3s ease;
  background: transparent;
  padding: 8px 24px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
