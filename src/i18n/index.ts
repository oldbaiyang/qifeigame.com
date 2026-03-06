import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'

// 支持的语言列表
const supportedLocales = ['zh-CN', 'zh-TW', 'en', 'ja']

// 检测浏览器语言
function detectBrowserLocale(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage

  // 直接匹配
  if (supportedLocales.includes(browserLang)) {
    return browserLang
  }

  // 匹配语言代码（忽略地区）
  const langCode = browserLang.split('-')[0].toLowerCase()

  // 中文特殊处理
  if (langCode === 'zh') {
    // zh-TW, zh-HK, zh-MO -> 繁体中文
    if (browserLang.toLowerCase().includes('tw') ||
        browserLang.toLowerCase().includes('hk') ||
        browserLang.toLowerCase().includes('mo')) {
      return 'zh-TW'
    }
    // 其他中文 -> 简体中文
    return 'zh-CN'
  }

  // 英语
  if (langCode === 'en') {
    return 'en'
  }

  // 日语
  if (langCode === 'ja') {
    return 'ja'
  }

  // 不支持的语言，默认英语
  return 'en'
}

// 从 localStorage 获取保存的语言，如果没有则检测浏览器语言
const savedLocale = localStorage.getItem('locale') || detectBrowserLocale()

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en': en,
    'ja': ja
  }
})

export default i18n

// 切换语言并保存到 localStorage
export function setLocale(locale: string) {
  i18n.global.locale.value = locale as any
  localStorage.setItem('locale', locale)
  // 更新 HTML lang 属性
  document.documentElement.lang = locale
}

// 语言选项
export const localeOptions = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' }
]
