<template>
  <div class="start-screen">
    <div class="content">
      <h1 class="title">极限脑力</h1>
      <p class="subtitle">动态数人头</p>

      <div class="buttons">
        <button class="btn btn-primary" @click="handleStart">
          开始游戏
        </button>
        <button class="btn btn-secondary" @click="handleShowRules">
          游戏说明
        </button>
      </div>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">最高分</span>
          <span class="stat-value">{{ highScore }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最高关卡</span>
          <span class="stat-value">{{ lastLevel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  highScore: number
  lastLevel: number
}>()

const emit = defineEmits<{
  (e: 'start'): void
  (e: 'showRules'): void
}>()

const handleStart = () => {
  emit('start')
}

const handleShowRules = () => {
  emit('showRules')
}
</script>

<style scoped>
.start-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.content {
  text-align: center;
  padding: 40px;
  max-width: 400px;
  width: 90%;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.6s ease;
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 48px;
  animation: slideDown 0.6s ease 0.1s backwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
  animation: slideUp 0.6s ease 0.2s backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn {
  height: 56px;
  font-size: 20px;
  font-weight: bold;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #ffffff;
  color: #667eea;
}

.btn-primary:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  animation: fadeIn 0.6s ease 0.4s backwards;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}
</style>
