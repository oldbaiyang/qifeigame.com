<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <!-- 正确/错误结果 -->
        <template v-if="!isGameOver">
          <h2 class="modal-title" :class="isCorrect ? 'success' : 'error'">
            {{ isCorrect ? $t('game.correct') : $t('game.wrong') }}
          </h2>
          <p class="modal-message">
            {{ isCorrect ? $t('game.greatJob') : `${$t('game.correctAnswer')} ${correctAnswer}` }}
          </p>
          <div class="modal-score">+{{ earnedScore }}</div>
          <div class="modal-buttons">
            <button class="modal-btn primary" @click="handleNext">
              {{ isCorrect ? $t('common.next') : $t('common.tryAgain') }}
            </button>
          </div>
        </template>

        <!-- 游戏结束 -->
        <template v-else>
          <h2 class="modal-title error">{{ $t('game.gameOver') }}</h2>
          <p class="modal-message">{{ $t('game.brainLimit') }}</p>
          <div class="modal-score">{{ finalScore }}</div>
          <p class="modal-message">{{ $t('common.highScore') }}: {{ highScore }}</p>
          <div class="modal-buttons">
            <button class="modal-btn primary" @click="handleRestart">
              {{ $t('common.restart') }}
            </button>
            <button class="modal-btn secondary" @click="handleShare">
              {{ $t('common.share') }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  isCorrect: boolean
  isGameOver: boolean
  correctAnswer: number
  earnedScore: number
  finalScore: number
  highScore: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'next'): void
  (e: 'restart'): void
  (e: 'share'): void
}>()

const handleClose = () => {
  emit('close')
}

const handleNext = () => {
  emit('next')
  emit('close')
}

const handleRestart = () => {
  emit('restart')
  emit('close')
}

const handleShare = () => {
  emit('share')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  animation: scaleIn 0.3s ease;
  transform-origin: center center;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
}

.modal-title.success {
  color: #44aa44;
}

.modal-title.error {
  color: #ff4444;
}

.modal-message {
  font-size: 16px;
  color: #888888;
  margin-bottom: 24px;
}

.modal-score {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-btn {
  height: 48px;
  font-size: 18px;
  font-weight: bold;
  border: 2px solid #1a1a1a;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.primary {
  background: #1a1a1a;
  color: #ffffff;
}

.modal-btn.primary:active {
  background: #ffd700;
  color: #1a1a1a;
  border-color: #ffd700;
}

.modal-btn.secondary {
  background: #ffffff;
  color: #1a1a1a;
}

.modal-btn.secondary:active {
  background: #f5f5f5;
}
</style>
