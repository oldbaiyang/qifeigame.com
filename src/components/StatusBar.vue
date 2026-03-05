<template>
  <div class="status-bar">
    <div class="status-item">
      <span class="status-label">关卡</span>
      <span class="status-value">{{ level }}</span>
    </div>

    <div class="status-item">
      <span class="status-label">生命</span>
      <div class="lives">
        <span
          v-for="i in maxLives"
          :key="i"
          class="heart"
          :class="{ lost: i > lives }"
        >
          {{ i <= lives ? '❤️' : '🖤' }}
        </span>
      </div>
    </div>

    <div class="status-item">
      <span class="status-label">分数</span>
      <span class="status-value">{{ score }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  level: number
  lives: number
  maxLives: number
  score: number
}>()
</script>

<style scoped>
.status-bar {
  height: 50px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e8eef5;
  border-bottom: 1px solid #cccccc;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.status-label {
  font-size: 11px;
  color: #666666;
}

.status-value {
  font-size: 18px;
  font-weight: bold;
  color: #000000;
}

.lives {
  display: flex;
  gap: 4px;
}

.heart {
  font-size: 18px;
  transition: all 0.3s ease;
}

.heart.lost {
  opacity: 0.2;
  transform: scale(0.8);
}
</style>
