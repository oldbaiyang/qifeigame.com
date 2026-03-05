/**
 * 海报生成器
 * 使用原生Canvas API生成分享海报
 */

interface PosterConfig {
  score: number
  level: number
  highScore: number
  date: string
  qrCodeUrl?: string
}

// 颜色配置
const COLORS = {
  background: '#1a1a1a',
  primary: '#ffffff',
  accent: '#ffd700',
  secondary: '#888888'
}

/**
 * 生成分享海报
 */
export async function generatePoster(config: PosterConfig): Promise<string> {
  const { score, level, highScore, date, qrCodeUrl } = config

  // 创建Canvas
  const canvas = document.createElement('canvas')
  const width = 375
  const height = 667
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  ctx.textBaseline = 'top'

  // 绘制背景
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // 绘制装饰线条
  ctx.strokeStyle = COLORS.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, 80)
  ctx.lineTo(width - 40, 80)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(40, height - 80)
  ctx.lineTo(width - 40, height - 80)
  ctx.stroke()

  // 绘制标题
  ctx.fillStyle = COLORS.primary
  ctx.font = 'bold 32px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('极限脑力', width / 2, 100)

  ctx.font = '24px Arial, sans-serif'
  ctx.fillStyle = COLORS.accent
  ctx.fillText('动态数人头', width / 2, 145)

  // 绘制分数区域
  ctx.fillStyle = '#2a2a2a'
  roundRect(ctx, 40, 200, width - 80, 180, 10)
  ctx.fill()

  // 分数标签
  ctx.fillStyle = COLORS.secondary
  ctx.font = '18px Arial, sans-serif'
  ctx.fillText('我的得分', width / 2, 220)

  // 分数数字
  ctx.fillStyle = COLORS.accent
  ctx.font = 'bold 72px Arial, sans-serif'
  ctx.fillText(score.toString(), width / 2, 260)

  // 关卡信息
  ctx.fillStyle = COLORS.primary
  ctx.font = '20px Arial, sans-serif'
  ctx.fillText(`第 ${level} 关`, width / 2, 350)

  // 最高分
  ctx.fillStyle = COLORS.secondary
  ctx.font = '16px Arial, sans-serif'
  ctx.fillText(`最高分: ${highScore}`, width / 2, 420)

  // 日期
  ctx.fillStyle = COLORS.secondary
  ctx.font = '14px Arial, sans-serif'
  ctx.fillText(date, width / 2, 460)

  // 绘制二维码区域（如果有）
  if (qrCodeUrl) {
    try {
      const qrImage = await loadImage(qrCodeUrl)
      const qrSize = 80
      ctx.drawImage(qrImage, width / 2 - qrSize / 2, height - 180, qrSize, qrSize)
    } catch (e) {
      console.warn('Failed to load QR code:', e)
    }
  }

  // 底部提示
  ctx.fillStyle = COLORS.secondary
  ctx.font = '14px Arial, sans-serif'
  ctx.fillText('扫码来挑战我吧!', width / 2, height - 60)

  // 返回Data URL
  return canvas.toDataURL('image/png')
}

/**
 * 绘制圆角矩形
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 加载图片
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 下载海报
 */
export function downloadPoster(dataUrl: string, filename: string = 'poster.png'): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 格式化日期
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
