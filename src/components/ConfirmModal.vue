<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <h2 class="modal-title">{{ $t('confirm.restartTitle') }}</h2>
        <p class="modal-message">
          {{ $t('confirm.restartMessage') }}
        </p>
        <div class="modal-buttons">
          <button class="modal-btn secondary" @click="handleCancel">
            {{ $t('common.cancel') }}
          </button>
          <button class="modal-btn primary" @click="handleConfirm">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
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
  color: #000000;
}

.modal-message {
  font-size: 16px;
  color: #888888;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
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
