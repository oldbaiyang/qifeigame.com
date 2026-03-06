<template>
  <div class="keypad" :class="{ disabled: !enabled }">
    <div class="answer-display">
      <input
        ref="inputRef"
        v-model="answer"
        type="number"
        inputmode="numeric"
        pattern="[0-9]*"
        :disabled="!enabled"
        :placeholder="$t('game.inputNumber')"
        class="answer-input"
        @keyup.enter="handleConfirm"
      />
    </div>

    <div class="button-group">
      <button
        class="btn btn-clear"
        :disabled="!enabled || !hasAnswer"
        @click="handleClear"
      >
        {{ $t('game.clear') }}
      </button>
      <button
        class="btn btn-confirm"
        :disabled="!enabled || !hasAnswer"
        @click="handleConfirm"
      >
        {{ $t('common.confirm') }}
      </button>
    </div>

    <button class="btn-restart" @click="handleRestart">
      🔄 {{ $t('common.restart') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  enabled: boolean
}>()

const emit = defineEmits<{
  (e: 'input', value: string): void
  (e: 'confirm', value: string): void
  (e: 'restart'): void
}>()

const answer = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

// 计算是否有输入
const hasAnswer = computed(() => {
  const str = String(answer.value || '').trim()
  return str.length > 0
})

// 监听输入变化
watch(answer, (newValue) => {
  const str = String(newValue || '')
  // 限制最多3位数字
  if (str.length > 3) {
    answer.value = str.slice(0, 3)
  }
  emit('input', String(answer.value || ''))
})

// 监听启用状态，自动聚焦
watch(() => props.enabled, (enabled) => {
  console.log('[NumericKeypad] enabled changed to:', enabled)
  if (enabled) {
    setTimeout(() => {
      inputRef.value?.focus()
      console.log('[NumericKeypad] Input focused')
    }, 100)
  }
})

const handleClear = () => {
  answer.value = ''
}

const handleConfirm = () => {
  console.log('[NumericKeypad] handleConfirm called, answer:', answer.value, 'type:', typeof answer.value)
  const answerStr = String(answer.value || '').trim()
  if (answerStr.length > 0) {
    emit('confirm', answerStr)
  } else {
    console.log('[NumericKeypad] No answer to confirm')
  }
}

const handleRestart = () => {
  emit('restart')
}

const clear = () => {
  answer.value = ''
}

defineExpose({ clear })
</script>

<style scoped>
.keypad {
  padding: 16px;
  background: #e8eef5;
  border-top: 1px solid #cccccc;
  transition: opacity 0.3s ease;
}

.keypad.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.keypad.disabled .btn-restart {
  opacity: 1 !important;
  pointer-events: auto !important;
}

.answer-display {
  text-align: center;
  margin-bottom: 16px;
}

.answer-input {
  width: 100%;
  max-width: 300px;
  height: 60px;
  font-size: 36px;
  font-weight: bold;
  color: #000000;
  text-align: center;
  border: 2px solid #000000;
  border-radius: 8px;
  background: #ffffff;
  outline: none;
  letter-spacing: 4px;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.answer-input::-webkit-outer-spin-button,
.answer-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.answer-input::placeholder {
  color: #999999;
  font-size: 20px;
  letter-spacing: normal;
}

.answer-input:focus {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.answer-input:disabled {
  background: #f0f0f0;
  color: #999999;
}

.button-group {
  display: flex;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.btn {
  flex: 1;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
  border: 1px solid #000000;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-clear {
  background: #ffffff;
  color: #000000;
}

.btn-clear:active:not(:disabled) {
  background: #f0f0f0;
}

.btn-confirm {
  background: #000000;
  color: #ffffff;
}

.btn-confirm:active:not(:disabled) {
  background: #333333;
}

.btn-restart {
  width: 100%;
  max-width: 300px;
  margin: 12px auto 0;
  height: 44px;
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #999999;
  border-radius: 8px;
  background: #ffffff;
  color: #666666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.btn-restart:active {
  transform: scale(0.98);
  background: #f0f0f0;
}
</style>
