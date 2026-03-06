<template>
  <div class="language-switcher">
    <button class="lang-btn" @click="toggleMenu">
      {{ currentFlag }} {{ currentLabel }}
    </button>

    <Transition name="dropdown">
      <div v-if="showMenu" class="lang-menu">
        <button
          v-for="option in localeOptions"
          :key="option.value"
          class="lang-option"
          :class="{ active: option.value === currentLocale }"
          @click="handleSelect(option.value)"
        >
          {{ option.flag }} {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, localeOptions } from '@/i18n'

const { locale } = useI18n()
const showMenu = ref(false)

const currentLocale = computed(() => locale.value)

const currentOption = computed(() => {
  return localeOptions.find(opt => opt.value === currentLocale.value) || localeOptions[0]
})

const currentFlag = computed(() => currentOption.value.flag)
const currentLabel = computed(() => currentOption.value.label)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleSelect = (value: string) => {
  setLocale(value)
  showMenu.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lang-btn:active {
  transform: scale(0.95);
  background: #f0f0f0;
}

.lang-menu {
  position: absolute;
  top: 42px;
  right: 0;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 140px;
}

.lang-option {
  width: 100%;
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  background: #ffffff;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-option:hover {
  background: #f0f0f0;
}

.lang-option.active {
  background: #000000;
  color: #ffffff;
}

.lang-option:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
