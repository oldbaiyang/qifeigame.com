<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <button class="close-btn" @click="handleClose">×</button>

        <h2 class="modal-title">{{ $t('rules.title') }}</h2>

        <div class="rules">
          <div class="rule-item">
            <div class="rule-number">1</div>
            <div class="rule-text">
              <strong>{{ $t('rules.step1Title') }}</strong>
              <p>{{ $t('rules.step1Desc') }}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-number">2</div>
            <div class="rule-text">
              <strong>{{ $t('rules.step2Title') }}</strong>
              <p>{{ $t('rules.step2Desc') }}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-number">3</div>
            <div class="rule-text">
              <strong>{{ $t('rules.step3Title') }}</strong>
              <p>{{ $t('rules.step3Desc') }}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-number">4</div>
            <div class="rule-text">
              <strong>{{ $t('rules.step4Title') }}</strong>
              <p>{{ $t('rules.step4Desc') }}</p>
            </div>
          </div>

          <div class="rule-item">
            <div class="rule-number">5</div>
            <div class="rule-text">
              <strong>{{ $t('rules.step5Title') }}</strong>
              <p>{{ $t('rules.step5Desc') }}</p>
            </div>
          </div>
        </div>

        <div class="game-rules">
          <h3>{{ $t('rules.gameRulesTitle') }}</h3>
          <ul>
            <li v-html="$t('rules.rule1')"></li>
            <li>{{ $t('rules.rule2') }}</li>
            <li>{{ $t('rules.rule3') }}</li>
            <li>{{ $t('rules.rule4') }}</li>
            <li>{{ $t('rules.rule5') }}</li>
          </ul>
        </div>

        <button class="modal-btn" @click="handleClose">
          {{ $t('rules.startChallenge') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  animation: fadeIn 0.2s ease;
  overflow-y: auto;
  padding: 20px;
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
  padding: 32px 24px;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s ease;
}

.close-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 24px;
  text-align: center;
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.rule-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.rule-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  flex-shrink: 0;
}

.rule-text {
  flex: 1;
}

.rule-text strong {
  display: block;
  font-size: 16px;
  color: #000000;
  margin-bottom: 4px;
}

.rule-text p {
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
}

.game-rules {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.game-rules h3 {
  font-size: 18px;
  color: #000000;
  margin-bottom: 12px;
}

.game-rules ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.game-rules li {
  font-size: 14px;
  color: #666666;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
}

.game-rules li::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #667eea;
  font-weight: bold;
}

.game-rules strong {
  color: #000000;
}

.modal-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}
</style>
